const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  const hashed = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    [name, email, hashed, role],
    (err) => {
      if (err) return res.json(err);
      res.json({ message: "User created" });
    }
  );
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    (err, results) => {
      if (err) return res.json(err);

      if (results.length === 0)
        return res.status(400).json({ message: "User not found" });

      const user = results[0];

      const valid = bcrypt.compareSync(password, user.password);

      if (!valid)
        return res.status(400).json({ message: "Wrong password" });

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});

module.exports = router;