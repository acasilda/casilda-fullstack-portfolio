
const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new Database(
  process.env.DB_PATH || path.join(__dirname, "portfolio.db")
);

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    technologies TEXT,
    link TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
  );
`);

const count = db.prepare(
  "SELECT COUNT(*) AS total FROM projects"
).get().total;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO projects (title, description, technologies, link)
    VALUES (?, ?, ?, ?)
  `);

  insert.run(
    "Personal Portfolio",
    "My personal portfolio website",
    "HTML, CSS, JavaScript",
    "https://github.com/"
  );

  insert.run(
    "Python Converter",
    "A unit conversion application",
    "Python",
    "https://github.com/"
  );

  insert.run(
    "Smart Parking System",
    "Parking management using C",
    "C Programming",
    "https://github.com/"
  );
}

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Projects API
app.get("/api/projects", (req, res) => {
  const projects = db.prepare(
    "SELECT * FROM projects ORDER BY id DESC"
  ).all();

  res.json(projects);
});

// Add project
app.post("/api/projects", (req, res) => {
  const { title, description, technologies, link } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "Project title is required"
    });
  }

  const result = db.prepare(`
    INSERT INTO projects (title, description, technologies, link)
    VALUES (?, ?, ?, ?)
  `).run(title, description || "", technologies || "", link || "");

  res.status(201).json({
    success: true,
    id: result.lastInsertRowid
  });
});

// Contact form
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "All fields are required"
    });
  }

  db.prepare(`
    INSERT INTO messages (name, email, message)
    VALUES (?, ?, ?)
  `).run(name, email, message);

  res.status(201).json({
    success: true,
    message: "Message received successfully"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Unknown routes
app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
