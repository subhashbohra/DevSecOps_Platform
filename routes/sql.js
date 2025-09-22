const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// in-memory DB for demo
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("INSERT INTO users (username, password) VALUES ('alice', 'alicepass')");
});

router.get('/user', (req, res) => {
  // VULN: SQL Injection via unsanitized user input
  const username = req.query.username || '';
  const q = "SELECT * FROM users WHERE username = '" + username + "'";
  db.all(q, (err, rows) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(rows);
  });
});

module.exports = router;
