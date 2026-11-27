const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(process.env.DB_PATH || path.join(__dirname, "portfolio.db"));

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Development',
    link TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const projectCount = db.prepare("SELECT COUNT(*) AS count FROM projects").get().count;
if (projectCount === 0) {
  const insert = db.prepare(`
    INSERT INTO projects (title, description, tech, category, link)
    VALUES (?, ?, ?, ?, ?)
  `);
  const seedProjects = [
    [
      "Smart Parking Management System",
      "A C-based parking management project using arrays and queues to manage vehicle entry, exit and parking slot availability.",
      "C, Arrays, Queue",
      "Programming",
      ""
    ],
    [
      "Python Converter Application",
      "A conversion application designed to convert values across temperature, weight, length and angle categories.",
      "Python",
      "Application",
      ""
    ],
    [
      "Resume Analysis & Job Matching",
      "A project concept for extracting skills from resumes, comparing them with job requirements and presenting a matching score.",
      "Python, Flask, NLP",
      "AI & Web",
      ""
    ]
  ];
  const seed = db.transaction((items) => items.forEach(item => insert.run(...item)));
  seed(seedProjects);
}

// API: list projects
app.get("/api/projects", (req, res) => {
  const projects = db.prepare(`
    SELECT id, title, description, tech, category, link
    FROM projects ORDER BY id DESC
  `).all();
  res.json(projects);
});

// API: add a project (useful when extending the portfolio)
app.post("/api/projects", (req, res) => {
  const { title, description, tech, category = "Development", link = "" } = req.body || {};
  if (![title, description, tech].every(value => typeof value === "string" && value.trim())) {
    return res.status(400).json({ error: "Title, description and technologies are required." });
  }
  if ([title, description, tech, category, link].some(value => String(value).length > 1000)) {
    return res.status(400).json({ error: "One or more fields are too long." });
  }

  const result = db.prepare(`
    INSERT INTO projects (title, description, tech, category, link)
    VALUES (?, ?, ?, ?, ?)
  `).run(title.trim(), description.trim(), tech.trim(), String(category).trim(), String(link).trim());

  res.status(201).json({ id: result.lastInsertRowid, message: "Project added successfully." });
});

// API: save contact messages
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body || {};
  const validEmail = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (![name, subject, message].every(value => typeof value === "string" && value.trim()) || !validEmail) {
    return res.status(400).json({ error: "Please enter a valid name, email, subject and message." });
  }
  if ([name, email, subject, message].some(value => value.length > 2000)) {
    return res.status(400).json({ error: "Your message is too long." });
  }

  db.prepare(`
    INSERT INTO messages (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `).run(name.trim(), email.trim(), subject.trim(), message.trim());

  res.status(201).json({ message: "Thank you! Your message has been saved." });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
});