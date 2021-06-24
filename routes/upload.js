const express = require("express");
const { resultSignQuick, resultSign } = require("../entity/upload_results");
const router = express.Router();
const fs = require("fs");
const path = require("path");
require("dotenv/config");

router.post("/sign", (req, res) => {
  const [sid, cid, fileNames, fileHashes] = [
    req.body.sid,
    req.body.cid,
    req.body.name.split(","),
    req.body.hash.split(","),
  ];
  if (fileNames.length !== fileHashes.length) {
    res.send(resultSign(0, "文件名有误", "", []));
    return;
  }
  let zipped = fileNames.map((el, i) => [el, fileHashes[i]]);
  let meta = [];
  zipped.forEach((file) => {
    const data = {
      sid,
      cid,
      file: file[0],
      hash: file[1],
    };
    meta.push(data);
  });
  res.send(resultSignQuick(meta));
});
router.post("/finish", (req, res) => {
  // todo 验证文件
  res.send({ code: 0 });
});
router.post("/fuckwoc", async (req, res) => {
  const [sid, cid, hash, file, size] = [
    req.body.sid,
    req.body.cid,
    req.body.hash,
    req.body.file,
    req.files.file.size,
  ];
  //无论如何都应该更新文件信息
  updateFileDatabase(sid, cid, hash, file, size);
  //如果是谱面，添加信息
  if (isChart(file)) {
    const [songInfo, chartInfo] = getInfoFromMc(req.files.file.data);
    updateChartDatabase(chartInfo, sid);
    updateSongDatabase(songInfo);
  }
  //如果是图片，更新图片
  if (isPic(req.files.file.data.toString("hex", 0, 4))) {
    updateSongBg(sid, file);
  }

  //创建歌曲目录
  checkDir(sid).then(() => {
    fs.writeFile(
      path.join(process.env.file_path, sid, file),
      req.files.file.data,
      (err) => {
        if (err) {
          console.log(`Write file ${file} error.`);
          console.log(err);
        }
        console.log(`Write file ${file} success.`);
      }
    );
    res.send();
  });
});

const getInfoFromMc = (fileBuffer) => {
  const admZip = require("adm-zip");
  const zip = new admZip(fileBuffer).getEntries();
  const data = zip[0].getData().toString("utf-8").trim();
  const mc = JSON.parse(data);
  const songInfo = {
    sid: mc.meta.song.id,
    title: mc.meta.song.title,
    artist: mc.meta.song.artist,
    bpm: mc.meta.song.bpm,
  };
  const chartInfo = {
    cid: mc.meta.id,
    creator: mc.meta.creator,
    version: mc.meta.version,
    mode: mc.meta.mode,
  };
  return [songInfo, chartInfo];
};

const updateSongBg = (sid, file) => {
  const cond = {
    sid: sid,
  };
  Songs.findOne({ where: cond }).then((res) => {
    if (!res) {
      const newSong = Songs.build({
        sid: sid,
        cover: file,
      });
      newSong.save();
    } else {
      res.cover = file;
      res.save();
    }
    console.log(`Updated sid=${sid} bg file ${file}`);
  });
};

const updateChartDatabase = (chartInfo, sid) => {
  const cond = {
    cid: chartInfo.cid,
  };
  Charts.findOne({ where: cond }).then((res) => {
    if (!res) {
      const newChart = Charts.build({
        cid: chartInfo.cid,
        sid: sid,
        creator: chartInfo.creator,
        version: chartInfo.version,
        mode: chartInfo.mode,
      });
      newChart.save();
    } else {
      res.creator = chartInfo.creator;
      res.version = chartInfo.version;
      res.mode = chartInfo.mode;
      res.save();
    }
    console.log(`Updated chart db sid=${sid}, cid=${chartInfo.cid}`);
  });
};

const updateSongDatabase = (songInfo) => {
  //更新歌曲db
  Songs.findOne({ where: { sid: Number(songInfo.sid) } }).then((res) => {
    if (!res) {
      console.log(`sid ${songInfo.sid} not exist, creating`);
      let attrs = {
        sid: Number(songInfo.sid),
        title: songInfo.title,
        orgTitle: songInfo.title,
        artist: songInfo.artist,
        bpm: songInfo.bpm,
        time: Math.floor(new Date().getTime() / 1000),
      };
      const newSong = Songs.build(attrs);
      newSong.save();
    } else {
      res.title = songInfo.title;
      res.orgTitle = songInfo.title;
      res.artist = songInfo.artist;
      res.bpm = songInfo.bpm;
      res.time = Math.floor(new Date().getTime() / 1000);
      res.save();
    }
  });
};

const db = require("../models/db");
const Files = db.Files;
const updateFileDatabase = (sid, cid, hash, file, size) => {
  //同一个sid中，文件名不改变则视为同一个文件。需测试
  const cond = {
    sid: Number(sid),
    cid: Number(cid),
    name: String(file),
  };
  //update file db
  Files.findOne({ where: cond }).then((item) => {
    if (!item) {
      const newfile = Files.build({
        sid: Number(sid),
        name: String(file),
        cid: Number(cid),
        hash: String(hash),
        size: Number(size),
        time: Math.floor(new Date().getTime() / 1000),
      });
      newfile.save();
    } else {
      item.hash = String(hash);
      item.size = Number(size);
      item.time = Math.floor(new Date().getTime() / 1000);
      item.save();
    }
    console.log(`Updated file db sid=${sid}, filename=${file}`);
  });
};

const fs_p = require("fs/promises");
const { Songs, Charts } = require("../models/db");
const checkDir = async (sid) => {
  await fs_p.access(path.join(process.env.file_path, sid)).catch((err) => {
    console.log(`access error: ${err}`);
    console.log(`No sid ${sid} folder, creating...`);
    fs_p
      .mkdir(path.join(process.env.file_path, sid), { recursive: true })
      .then(() => console.log(`Created folder ${sid}`))
      .catch((err) => console.log(`mkdir error: ${err}`));
  });
};

const isChart = (file) => {
  const re = /.mc$/;
  return re.exec(file);
};

const isPic = (dataHead) => {
  const magic = {
    jpg: "ffd8ffe0",
    png: "89504e47",
    gif: "47494638",
  };
  return (
    dataHead == magic.jpg || dataHead == magic.png || dataHead == magic.gif
  );
};

module.exports = router;
