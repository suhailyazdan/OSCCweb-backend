const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Default route to confirm API is working
app.get("/", (req, res) => {
  res.send("Express API is running successfully on Vercel!");
});

// Define an endpoint to save user details
app.post("/saveUser", (req, res) => {
  const { email, name, image } = req.body;

  // Check if user already exists
  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], (checkError, results) => {
    if (checkError) return res.status(500).send(checkError);

    if (results.length > 0) {
      return res.status(409).send("User already exists");
    }

    // If user doesn't exist, insert new record
    const insertQuery = "INSERT INTO users (email, name, image) VALUES (?, ?, ?)";
    db.query(insertQuery, [email, name, image], (insertError, insertResult) => {
      if (insertError) return res.status(500).send(insertError);

      res.status(201).send("User saved successfully");
    });
  });
});

// Export the Express app as a serverless function
module.exports = app;
