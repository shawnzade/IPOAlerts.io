const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.use(cors());
app.use(express.json());

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  db.run(`INSERT OR IGNORE INTO users (email) VALUES (?)`, [email], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  db.run(`INSERT OR REPLACE INTO users (email, password) VALUES (?, ?)`, [email, password], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

app.get('/api/users', (req, res) => {
  db.all(`SELECT id, email, created_at FROM users`, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
