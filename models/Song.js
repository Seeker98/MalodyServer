module.exports = (sequelize, Sequelize) => {
  const Song = sequelize.define(
    "Song",
    {
      sid: {
        type: Sequelize.INTEGER,
        unique: true,
      },
      cover: Sequelize.STRING,
      length: Sequelize.INTEGER,
      bpm: Sequelize.FLOAT,
      // mode: Sequelize.INTEGER,
      title: Sequelize.STRING,
      artist: Sequelize.STRING,
      orgTitle: Sequelize.STRING,
      time: Sequelize.BIGINT,
    },
    { modelName: "Song", timestamps: false }
  );
  return Song;
};
