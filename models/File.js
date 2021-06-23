module.exports = (sequelize, Sequelize) => {
  const File = sequelize.define(
    "File",
    {
      sid: Sequelize.INTEGER,
      cid: Sequelize.INTEGER,
      hash: Sequelize.STRING,
      size: Sequelize.INTEGER,
      name: Sequelize.INTEGER,
      time: Sequelize.BIGINT,
    },
    { modelName: "File", timestamps: false }
  );
  return File;
};
