const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* =========================
   👨‍🏫 CREATE ROOM
========================= */
router.post("/create", (req, res) => {
  const { name, created_by, start_time, end_time } = req.body;

  db.query(
    "INSERT INTO rooms (name, created_by, start_time, end_time, status) VALUES (?,?,?,?, 'scheduled')",
    [name, created_by, start_time, end_time],
    (err) => {
      if (err) return res.json(err);
      res.json({ message: "Room created" });
    }
  );
});

/* =========================
   📊 GET ROOMS
========================= */
router.get("/", (req, res) => {
  db.query("SELECT * FROM rooms", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

module.exports = router;