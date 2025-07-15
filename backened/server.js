const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const port = 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from /public

// ✅ MySQL Connection (AWS RDS)
const db = mysql.createConnection({
  host: "rdb-1.cmtqgo44kx78.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "santoor123",
  database: "meesho",
  port: 3306,
  connectTimeout: 10000
});

// ✅ Log connection details
console.log("🔍 Connecting to:", db.config.host, db.config.port);

// ✅ Connect to RDS
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    return;
  }
  console.log("✅ Connected to RDS!");
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Meesho Clone backend is running");
});

// ✅ Signup route
app.post("/api/signup", async (req, res) => {
  const { name, email, mobile, password, confirmPassword } = req.body;

  console.log("📥 Signup request:", req.body);

  if (!name || !email || !mobile || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const checkQuery = "SELECT * FROM users WHERE email = ? OR mobile = ?";
    db.query(checkQuery, [email, mobile], async (err, results) => {
      if (err) {
        console.error("❌ DB check error:", err);
        return res.status(500).json({ message: "Database error during check" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = "INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)";
      db.query(insertQuery, [name, email, mobile, hashedPassword], (err, result) => {
        if (err) {
          console.error("❌ DB insert error:", err);
          return res.status(500).json({ message: "Error creating user" });
        }

        console.log("✅ User inserted:", { name, email, mobile });
        res.status(201).json({
          message: "User registered successfully",
          user: { name, email, mobile }
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ✅ Login route
app.post("/api/login", (req, res) => {
  const { name, password } = req.body;

  console.log("🔐 Login attempt for:", name);

  const query = "SELECT * FROM users WHERE name = ?";
  db.query(query, [name], async (err, results) => {
    if (err) {
      console.error("❌ Login DB error:", err);
      return res.status(500).json({ message: "Database error during login" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid name or password" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid name or password" });
    }

    const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: "1h" });

    console.log("✅ Login successful for:", name);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    });
  });
});

// ✅ Start the server (bind to all interfaces)
app.get("/", (req, res) => {
  res.send("✅ Meesho Clone backend is running");
});
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
});
