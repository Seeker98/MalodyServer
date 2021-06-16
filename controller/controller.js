const db = require("../models/db");
const { result } = require("../entity/result");
const { Op } = require("sequelize");
const Songs = db.Songs;
const Charts = db.Charts;

//一页返回12个
const pageSize = 12;
exports.list = async (req, res) => {
  const params = req.query;
  console.log("query params: ", req.query);
  const [word, org, mode, lvge, lvle, beta, from] = [
    params.word,
    params.org,
    params.mode,
    params.lvge,
    params.lvle,
    params.beta,
    params.from ? params.from : 0,
  ];
  let attrsList = ["sid", "cover", "length", "bpm", "title", "artist", "time"];
  if (org) {
    attrsList.push("orgTitle");
  }
  //歌曲查询条件
  let cond = {};
  if (word) {
    cond.title = { [Op.like]: `%${word}%` };
  }
  //谱面查询条件
  let chartCond = {};
  if (mode && mode !== -1) {
    chartCond.mode = { [Op.eq]: mode };
  }
  chartCond.level = {
    [Op.gte]: lvge ? lvge : -1,
    [Op.lte]: lvle ? lvle : 1000,
  };
  if (beta) {
    chartCond.beta = { [Op.eq]: beta };
  }
  let songList = await Songs.findAll({
    where: cond,
    attributes: attrsList,
    offset: from * pageSize,
    limit: pageSize,
  });
  songList.forEach((song) => (song.mode = 0));
  let sidArr = [];
  songList.forEach((song) => sidArr.push(song.sid));
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
  const hasMore = songList.length >= 10;
  const next = hasMore ? from + 1 : from;
  res.json(result(hasMore, next, songList));
};
