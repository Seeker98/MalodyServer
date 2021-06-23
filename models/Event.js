module.exports = (sequelize, Sequelize) => {
  const Event = sequelize.define(
    "Event",
    {
      eid: {
        type: Sequelize.INTEGER,
        unique: true,
      },
      name: Sequelize.STRING,
      start: Sequelize.STRING,
      end: Sequelize.STRING,
      cover: Sequelize.STRING,
    },
    { modelName: "Event", timestamps: false }
  );
  return Event;
};
