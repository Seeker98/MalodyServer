const express = require("express");
const app = express();
require("dotenv/config");
const mStore = require("./routes/store");

// Serve files
app.use("/storage", express.static(process.env.file_path));
// handle json and x-www-form-urlencoded body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// handle multipart/form-data body
app.use(require("express-fileupload")());
// log request method and route
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const db = require("./models/db");
db.sequelize.sync({ alter: true, benchmark: true, logging: false });
app.use("/api/store", mStore);

app.get("/", (req, res) => {
  res.send("Hello Seeker, when will you release Malody V store server?");
});
app.listen(process.env.server_port, () =>
  console.log(`Listening on ${process.env.server_port}`)
);
