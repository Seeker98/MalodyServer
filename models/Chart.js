module.exports = (sequelize, Sequelize) => {
  const Chart = sequelize.define(
    "Chart",
    {
      cid: {
        type: Sequelize.INTEGER,
        unique: true,
      },
      sid: Sequelize.INTEGER,
      uid: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      creator: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      version: {
        type: Sequelize.STRING,
        defaultValue: "Unknown",
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      length: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      type: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      size: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      mode: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    { modelName: "Chart", timestamps: false }
  );
  return Chart;
};
