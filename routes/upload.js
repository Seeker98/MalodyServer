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
  //todo添加新sid
  console.log(req.files.file);
  console.log(req.body);
  const [sid, cid, hash, file, size] = [
    req.body.sid,
    req.body.cid,
    req.body.hash,
    req.body.file,
    req.files.file.size,
  ];
  console.log(`${size} is ${typeof size}`);
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

const db = require("../models/db");
const Files = db.Files;
const updateDatabase = (sid, cid, hash, file, size) => {
  //同一个sid中，文件名不改变则视为同一个文件。需测试
  const cond = {
    sid: Number(sid),
    name: String(file),
  };
  Files.findOne({ where: cond }).then((item) => {
    if (!item) {
      const newfile = Files.build({
        sid: Number(sid),
        name: String(file),
        cid: Number(cid),
        hash: String(hash),
        size: Number(size),
        time: new Date().getTime(),
      });
      newfile.save();
    } else {
      item.cid = Number(cid);
      item.hash = String(hash);
      item.size = Number(size);
      item.time = new Date().getTime();
      item.save();
    }
  });
};

const fs_p = require("fs/promises");
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
