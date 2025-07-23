require("dotenv").config(); // ✅ Load .env
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Debug Logger
app.use((req, res, next) => {
  console.log([${req.method}] ${req.url});
  next();
});

app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ MySQL Connection (AWS RDS)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// ✅ Log connection details
console.log("🔍 Connecting to:", db.config.host, db.config.port);

// ✅ Connect to RDS
db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

// ------------------ HEALTH ENDPOINTS ------------------

// Basic liveness check for Load Balancer health checks.
// Always responds quickly with 200 OK if Node process + network stack are up.
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Optional deeper readiness check: verifies DB connectivity.
// DO NOT point ALB health checks here if DB outages would cause scale-out thrash.
app.get('/ready', (req, res) => {
  db.ping((err) => {
    if (err) {
      console.error('DB ping failed:', err);
      return res.status(500).send('DB error');
    }
    res.status(200).send('READY');
  });
});

// ------------------------------------------------------

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/signup.html"));
});
// ===================== SIGNUP ROUTE =====================
app.post('/signup', (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const sql = 'INSERT INTO signup (fullname, email, password) VALUES (?, ?, ?)';
  db.query(sql, [fullname, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting signup:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Signup successful' });
  });
});

// ===================== LOGIN ROUTE =====================
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM signup WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
});

// ===================== CONTACT ROUTE =====================
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO contact (name, email, message) VALUES (?, ?, ?)';
  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error('Error inserting contact message:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json({ message: 'Message received successfully!' });
  });
});

// ===================== START SERVER =====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(🚀 Server running at http://0.0.0.0:${PORT});
});
