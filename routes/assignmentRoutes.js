const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");

/* =========================
   CREATE ASSIGNMENT
========================= */
router.post("/create", auth, (req, res) => {
  const { title, description, file } = req.body;

  db.query(
    "INSERT INTO assignments (title, description, file, lecturer_id) VALUES (?,?,?,?)",
    [title, description, file, req.user.id],
    (err) => {
      if (err) return res.json(err);
      res.json({ message: "Assignment created" });
    }
  );
});

/* =========================
   SUBMIT ASSIGNMENT
========================= */
router.post("/submit", auth, (req, res) => {
  const { assignment_id, file } = req.body;

  db.query(
    "INSERT INTO submissions (assignment_id, student_id, file) VALUES (?,?,?)",
    [assignment_id, req.user.id, file],
    (err) => {
      if (err) return res.json(err);
      res.json({ message: "Submitted" });
    }
  );
});

/* =========================
   GRADE SUBMISSION
========================= */
router.post("/grade", auth, (req, res) => {
  const { submission_id, grade, feedback } = req.body;

  db.query(
    "UPDATE submissions SET grade=?, feedback=? WHERE id=?",
    [grade, feedback, submission_id],
    (err) => {
      if (err) return res.json(err);
      res.json({ message: "Graded" });
    }
  );
});

/* =========================
   GET ALL ASSIGNMENTS
========================= */
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM assignments ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.json(err);
      res.json(results);
    }
  );
});

/* =========================
   GET SINGLE ASSIGNMENT + SUBMISSIONS
========================= */
router.get("/:id", (req, res) => {
  const sql = `
    SELECT a.*, 
           s.id AS submission_id,
           s.file AS submission_file,
           u.name AS student_name
    FROM assignments a
    LEFT JOIN submissions s ON a.id = s.assignment_id
    LEFT JOIN users u ON s.student_id = u.id
    WHERE a.id = ?
  `;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.json(err);
    res.json(results);
  });
});

module.exports = router;