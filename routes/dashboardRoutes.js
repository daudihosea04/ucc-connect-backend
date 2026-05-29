const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* =========================
   📊 DASHBOARD STATS
========================= */
router.get("/stats", (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) AS total FROM users WHERE role='student'", (err, s) => {
    if (err) return res.json(err);
    stats.students = s[0].total;

    db.query("SELECT COUNT(*) AS total FROM users WHERE role='lecturer'", (err, l) => {
      if (err) return res.json(err);
      stats.lecturers = l[0].total;

      db.query("SELECT COUNT(*) AS total FROM messages", (err, m) => {
        if (err) return res.json(err);
        stats.messages = m[0].total;

        db.query("SELECT COUNT(*) AS total FROM assignments", (err, a) => {
          if (err) return res.json(err);
          stats.assignments = a[0].total;

          res.json(stats);
        });
      });
    });
  });
});

module.exports = router;