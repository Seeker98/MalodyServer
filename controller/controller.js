const db = require("../models/db");
const { result } = require("../entity/result");
const { Op } = require("sequelize");
const Songs = db.Songs;
const Charts = db.Charts;

//一页返回12个
const pageSize = 12;

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
  if (!beta) cond.beta = { [Op.eq]: 0 };
  if (mode) cond.mode = { [Op.eq]: mode };
  let chartList = await Charts.findAll({
    where: cond,
    attributes: attrsList,
    offset: from * pageSize,
    limit: pageSize,
  });
  const hasMore = songList.length >= pageSize;
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
    params?.lvge,
    params?.lvle,
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
  });

  let sidArr = [];
  songList.forEach((song) => {
    song.mode = 0;
    sidArr.push(song.sid);
  });
  //谱面查询条件
  let chartCond = {};
  if (mode) chartCond.mode = { [Op.eq]: mode };
  chartCond.level = {
    [Op.gte]: lvge ? lvge : -1,
    [Op.lte]: lvle ? lvle : 1000,
  };
  if (!beta) chartCond.beta = { [Op.eq]: 0 };
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
