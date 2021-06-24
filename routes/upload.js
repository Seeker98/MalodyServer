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
  //如果是谱面，添加信息
  if (isChart(file)) {
    updateChartDatabase(sid, cid);
  }
  //如果是图片，更新图片
  const flag = checkPic(req.files.file.data.toString("hex", 0, 4));
  //更新歌曲db
  Songs.findOne({ where: { sid: Number(sid) } }).then((res) => {
    if (!res) {
      console.log(`sid ${sid} not exist, creating`);
      let attrs = {
        sid: Number(sid),
        title: `s${sid}`,
        orgTitle: `s${sid}`,
        time: Math.floor(new Date().getTime() / 1000),
      };
      if (flag) attrs.cover = file;
      const newSong = Songs.build(attrs);
      newSong.save();
    } else {
      res.time = Math.floor(new Date().getTime() / 1000);
      if (flag) res.cover = file;
      res.save();
    }
  });

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
    updateDatabase(sid, cid, hash, file, size);
    res.send();
  });
});

const updateChartDatabase = (sid, cid) => {
  const cond = {
    cid: cid,
  };
  Charts.findOne({ where: cond }).then((res) => {
    if (!res) {
      const newChart = Charts.build({
        cid: cid,
        sid: sid,
      });
      newChart.save();
    } else {
      //todo updatechartinfo
    }
    console.log(`Updated chart db sid=${sid}, cid=${cid}`);
  });
};

const isChart = (file) => {
  const re = /.mc$/;
  return re.exec(file);
};

const checkPic = (dataHead) => {
  const magic = {
    jpg: "ffd8ffe0",
    png: "89504e47",
    gif: "47494638",
  };
  return (
    dataHead == magic.jpg || dataHead == magic.png || dataHead == magic.gif
  );
};

const db = require("../models/db");
const Files = db.Files;
const updateDatabase = (sid, cid, hash, file, size) => {
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
module.exports = router;
