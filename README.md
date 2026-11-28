## Live Demo

[View My Portfolio](https://casilda-fullstack-portfolio-1.onrender.com)# Casilda A – Full Stack Personal Portfolio

A responsive dark-themed personal portfolio built with HTML, CSS, JavaScript, Node.js, Express and SQLite.

## Features
- Responsive portfolio sections: Home, About, Skills, Projects and Experience
- Projects loaded dynamically from the SQLite database
- Express API to list and add projects
- Contact form that saves messages in SQLite
- Mobile navigation and accessible form labels

## Requirements
- Node.js 20 or newer
- npm

## Run locally
1. Open this folder in VS Code.
2. Open a terminal in this folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open http://localhost:3000 in your browser.

The database file `portfolio.db` is created automatically on first run and starter projects are inserted automatically.

## API endpoints
- `GET /api/health` – check server status
- `GET /api/projects` – get all portfolio projects
- `POST /api/projects` – add a project
- `POST /api/contact` – save a contact message

### Add a project example
Send a POST request to `/api/projects` with JSON:

```json
{
  "title": "My New Project",
  "description": "A short project description.",
  "tech": "HTML, CSS, JavaScript",
  "category": "Web Development",
  "link": ""
}
```

## Deployment notes
This is a single full-stack Express application, so deploy the entire project to a Node.js host such as Render. Set the build command to `npm install` and the start command to `npm start`.

For persistent SQLite data on Render, attach a persistent disk and set the environment variable `DB_PATH` to a file path on that disk, for example `/var/data/portfolio.db`. Without persistent storage, SQLite data may be lost when the host replaces the service instance.

## Before publishing
- Replace the GitHub and LinkedIn profile links in `public/index.html` with your actual profile URLs.
- Confirm your education, internship dates and project descriptions are accurate.
- Do not add private information you do not want publicly visible.
