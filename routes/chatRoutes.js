const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET QUESTIONS HISTORY
router.get("/questions/:room", (req, res) => {
  db.query(
    "SELECT * FROM questions WHERE room=?",
    [req.params.room],
    (err, results) => {
      if (err) return res.json(err);
      res.json(results);
    }
  );
});

module.exports = router;