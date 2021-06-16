const express = require("express");
const router = express.Router();
const { result } = require("../entity/result");

const storeMapper = require("../controller/controller");

router.get("/list", storeMapper.list);
router.get("/promote", (req, res) => {
  res.json(result([]));
});
router.get("/charts", (req, res) => {
  res.json(result([]));
});
router.get("/query", (req, res) => {
  res.json(result([]));
});
router.get("/download", (req, res) => {
  res.json(result([]));
});
router.get("/events", (req, res) => {
  res.json(result([]));
});
router.get("/event", (req, res) => {
  res.json(result([]));
});

const mUpload = require("./upload");
router.use("/upload", mUpload);

module.exports = router;
