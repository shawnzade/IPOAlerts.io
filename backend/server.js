const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  // Preferences table
  db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    investor TEXT,
    company TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  // Alert log table
  db.run(`CREATE TABLE IF NOT EXISTS alert_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company TEXT,
    alerted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

app.use(cors());
app.use(express.json());

// Subscribe for email updates (no password)
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

// Register with password hashing
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(
    `INSERT OR REPLACE INTO users (email, password) VALUES (?, ?)`,
    [email, hashedPassword],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  db.get(`SELECT id, password FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    bcrypt.compare(password, row.password, (err2, match) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Error verifying password' });
      }
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({ success: true, userId: row.id });
    });
  });
});

// Reset password
app.post('/api/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.run(`UPDATE users SET password = ? WHERE email = ?`, [hashedPassword, email], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  });
});

// Get preferences for a user
app.get('/api/preferences/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(
    `SELECT investor, company FROM user_preferences WHERE user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Add a preference
app.post('/api/preferences', (req, res) => {
  const { userId, investor, company } = req.body;
  if (!userId || (!investor && !company)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  db.run(
    `INSERT INTO user_preferences (user_id, investor, company) VALUES (?, ?, ?)`,
    [userId, investor || null, company || null],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// List users (admin or debug)
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
