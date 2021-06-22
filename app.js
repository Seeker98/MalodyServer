const express = require("express");
const app = express();
require("dotenv/config");
const mStore = require("./routes/store");

const bodyParser = require("body-parser");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require("express-fileupload")());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const db = require("./models/db");
db.sequelize.sync({ alter: true, benchmark: true });
app.use("/api/store", mStore);

app.get("/", (req, res) => {
  res.send("hello");
});
app.listen(43927, () => console.log("listening on 43927"));
