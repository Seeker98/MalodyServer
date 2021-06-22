const { Sequelize, DataTypes, Model } = require("sequelize");

var db = {};
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.db_path,
});

db.Songs = require("./Song")(sequelize, Sequelize);
db.Charts = require("./Chart")(sequelize, Sequelize);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
