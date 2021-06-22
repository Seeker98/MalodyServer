module.exports = (sequelize, Sequelize) => {
  const Chart = sequelize.define(
    "Chart",
    {
      cid: {
        type: Sequelize.INTEGER,
        unique: true,
      },
      sid: Sequelize.INTEGER,
      uid: Sequelize.INTEGER,
      creator: Sequelize.STRING,
      version: Sequelize.STRING,
      level: Sequelize.INTEGER,
      length: Sequelize.INTEGER,
      type: Sequelize.INTEGER,
      size: Sequelize.BIGINT,
      mode: Sequelize.INTEGER,
    },
    { modelName: "Chart", timestamps: false }
  );
  return Chart;
};
