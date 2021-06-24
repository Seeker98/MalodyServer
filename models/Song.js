module.exports = (sequelize, Sequelize) => {
  const Song = sequelize.define(
    "Song",
    {
      sid: {
        type: Sequelize.INTEGER,
        unique: true,
      },
      cover: Sequelize.STRING,
      length: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      bpm: {
        type: Sequelize.FLOAT,
        defaultValue: 120,
      },
      // mode: Sequelize.INTEGER,
      title: Sequelize.STRING,
      artist: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      orgTitle: Sequelize.STRING,
      time: Sequelize.BIGINT,
    },
    { modelName: "Song", timestamps: false }
  );
  return Song;
};
