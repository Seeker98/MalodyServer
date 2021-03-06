const db = require("../models/db");
const { result, downloadResult } = require("../entity/result");
const { Op } = require("sequelize");
const Songs = db.Songs;
const Charts = db.Charts;
const Files = db.Files;
const urlJoin = require("url-join");
require("dotenv/config");

//一页返回12个
const pageSize = 12;

exports.download = async (req, res) => {
  const params = req.query;
  const cid = params.cid;
  const cond = {
    cid: cid,
  };
  const attrs = ["sid", "cid", "name", "hash"];
  let downloadList = await Files.findAll({ where: cond, attributes: attrs });
  if (!downloadList) {
    res.send(downloadResult(-2, [], 0, 0));
    return;
  }
  let items = [];
  downloadList.forEach((file) => {
    items.push({
      name: file.name,
      hash: file.hash,
      file: urlJoin(
        `http://${process.env.server_addr}:${process.env.server_port}`,
        "storage",
        String(file.sid),
        String(file.name)
      ),
    });
  });
  res.json(downloadResult(0, items, downloadList[0].sid, downloadList[0].cid));
};

//指定查询
exports.query = async (req, res) => {
  const params = req.query;
  console.log(req.query);
  const [sid, cid, org] = [
    params.sid ? Number(params.sid) : undefined,
    params.cid ? Number(params.cid) : undefined,
    params.org ? Number(params.org) : 0,
  ];
  let sids = [];
  if (sid) sids.push(sid);
  if (cid) {
    let attrsList = ["sid"];
    Charts.findAll({
      where: {
        cid: { [Op.eq]: cid },
      },
      attributes: attrsList,
    }).then((charts) => {
      charts.forEach((chart) => sids.push(chart.sid));
    });
  }
  let attrsList = ["sid", "cover", "length", "bpm", "title", "artist", "time"];
  if (org) attrsList.push("orgTitle");
  let songList = await Songs.findAll({
    where: {
      sid: { [Op.in]: sids },
    },
    attributes: attrsList,
  });
  // const hasMore = songList.length >= pageSize;
  // const next = hasMore ? from + 1 : from;
  res.json(result(false, 0, songList));
};

//谱面列表
exports.charts = async (req, res) => {
  const params = req.query;
  console.log(req.query);
  const [sid, beta, mode, from] = [
    params.sid,
    params?.beta ? params.beta : 0,
    params?.mode ? Number(params.mode) : 0,
    params?.from ? Number(params.from) : 0,
  ];
  //返回属性列表
  let attrsList = [
    "cid",
    "uid",
    "creator",
    "version",
    "level",
    "length",
    "type",
    "size",
    "mode",
  ];
  //谱面查询条件
  let cond = {};
  cond.sid = { [Op.eq]: sid };
  if (!beta) cond.type = { [Op.gt]: 1 };
  if (mode) cond.mode = { [Op.eq]: mode };
  let chartList = await Charts.findAll({
    where: cond,
    attributes: attrsList,
    offset: from * pageSize,
    limit: pageSize,
  });
  const hasMore = chartList.length >= pageSize;
  const next = hasMore ? from + 1 : from;
  res.json(result(hasMore, next, chartList));
};

//todo 进行类型转换
// 歌曲列表
exports.list = async (req, res) => {
  const params = req.query;
  console.log("query params: ", req.query);
  const [word, org, mode, lvge, lvle, beta, from] = [
    params?.word,
    params?.org,
    params?.mode ? Number(params.mode) : 0,
    params?.lvge ? Number(params.lvge) : undefined,
    params?.lvle ? Number(params.lvle) : undefined,
    params?.beta ? params.beta : 0,
    params?.from ? params.from : 0,
  ];
  let attrsList = ["sid", "cover", "length", "bpm", "title", "artist", "time"];
  if (org) attrsList.push("orgTitle");
  //歌曲查询条件
  let cond = {};
  if (word) cond.title = { [Op.like]: `%${word}%` };
  let songList = await Songs.findAll({
    where: cond,
    attributes: attrsList,
    offset: from * pageSize,
    limit: pageSize,
    order: ["sid"],
  });

  let sidArr = [];
  songList.forEach((song) => {
    song.mode = 0;
    sidArr.push(song.sid);
    song.cover = urlJoin(
      `http://${process.env.server_addr}:${process.env.server_port}`,
      "storage",
      String(song.sid),
      String(song.cover)
    );
  });
  //谱面查询条件
  let chartCond = {};
  if (mode) chartCond.mode = { [Op.eq]: mode };
  chartCond.level = {
    [Op.gte]: lvge ? lvge : -1,
    [Op.lte]: lvle ? lvle : 1000,
  };
  if (!beta) chartCond.type = { [Op.gt]: 1 };
  chartCond.sid = { [Op.in]: sidArr };
  Charts.findAll({
    where: chartCond,
    attributes: ["mode", "sid"],
  }).then((charts) => {
    charts.forEach((chart) => {
      songList.forEach((song) => {
        if (chart.sid === song.sid) {
          song.mode = song.mode | (1 << chart.mode);
        }
      });
    });
  });
  const hasMore = songList.length >= pageSize;
  const next = hasMore ? from + 1 : from;
  res.json(result(hasMore, next, songList));
};
