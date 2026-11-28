
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Frontend files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "style.css"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "script.js"));
});

// MongoDB Schemas
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  technologies: String,
  link: String
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
const Message = mongoose.model("Message", messageSchema);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(projects.map(project => ({
      ...project,
      id: project._id.toString()
    })));
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch projects" });
  }
});

// Add a project
app.post("/api/projects", async (req, res) => {
  try {
    const { title, description, technologies, link } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title required" });
    }

    const project = await Project.create({
      title,
      description: description || "",
      technologies: technologies || "",
      link: link || ""
    });

    res.status(201).json({
      success: true,
      id: project._id.toString()
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to add project" });
  }
});

// Contact form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    await Message.create({ name, email, message });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to save message" });
  }
});

// Connect MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is missing");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "casildaPortfolio"
    });

    console.log("MongoDB connected successfully");

    // Add sample projects only if collection is empty
    const count = await Project.countDocuments();

    if (count === 0) {
      await Project.insertMany([
        {
          title: "Personal Portfolio",
          description: "My portfolio website",
          technologies: "HTML, CSS, JavaScript"
        },
        {
          title: "Python Converter",
          description: "Unit converter application",
          technologies: "Python"
        },
        {
          title: "Smart Parking System",
          description: "Parking management project",
          technologies: "C"
        }
      ]);
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
