const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, role(["admin", "lecturer"]), (req, res) => {
  const data = {};

  db.query("SELECT COUNT(*) AS total FROM users WHERE role='student'", (err, s) => {
    data.students = s[0].total;

    db.query("SELECT COUNT(*) AS total FROM rooms WHERE status='active'", (err, r) => {
      data.active_rooms = r[0].total;

      db.query("SELECT COUNT(*) AS total FROM messages", (err, m) => {
        data.messages = m[0].total;

        db.query("SELECT COUNT(*) AS total FROM assignments", (err, a) => {
          data.assignments = a[0].total;

          res.json(data);
        });
      });
    });
  });
});

module.exports = router;