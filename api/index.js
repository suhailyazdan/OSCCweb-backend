const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: ["https://osccweb.vercel.app"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
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
  console.log("Received data:", req.body);  // Log received data

  // Check if user already exists
  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], (checkError, results) => {
    if (checkError) {
      console.error("Database error:", checkError);
      return res.status(500).send(checkError);
    }

    if (results.length > 0) {
      console.log("User already exists");
      return res.status(409).send("User already exists");
    }

    // If user doesn't exist, insert new record
    const insertQuery = "INSERT INTO users (email, name, image) VALUES (?, ?, ?)";
    db.query(insertQuery, [email, name, image], (insertError, insertResult) => {
      if (insertError) {
        console.error("Insert error:", insertError);
        return res.status(500).send(insertError);
      }

      console.log("User saved successfully:", insertResult);
      res.status(201).send("User saved successfully");
    });
  });
});

app.listen(3510, () => console.log("Server ready on port 3510."));

// Export the Express app as a serverless function
module.exports = app;
