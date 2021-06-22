const express = require("express");
const { resultSignQuick, resultSign } = require("../entity/upload_results");
const router = express.Router();
const fs = require("fs");
const path = require("path");
require("dotenv/config");

router.post("/sign", (req, res) => {
  // fs.readdir(process.env.file_path, (err, files) => {
  //   console.log(files);
  // });
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
  // console.log(req.body);
  res.send({ code: 0 });
});
router.post("/fuckwoc", async (req, res) => {
  // console.log(req.files.file);
  const [sid, file] = [req.body.sid, req.body.file];
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
