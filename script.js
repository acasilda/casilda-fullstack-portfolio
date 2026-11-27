const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  menuToggle.textContent = isOpen ? "×" : "☰";
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const projectsGrid = document.getElementById("projectsGrid");

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card panel";

  const top = document.createElement("div");
  top.className = "project-top";
  const icon = document.createElement("span");
  icon.className = "project-icon";
  icon.textContent = "</>";
  const category = document.createElement("span");
  category.className = "project-category";
  category.textContent = project.category;
  top.append(icon, category);

  const title = document.createElement("h3");
  title.textContent = project.title;
  const description = document.createElement("p");
  description.textContent = project.description;
  const tech = document.createElement("div");
  tech.className = "project-tech";
  String(project.tech).split(",").forEach(item => {
    const tag = document.createElement("span");
    tag.textContent = item.trim();
    tech.appendChild(tag);
  });

  article.append(top, title, description, tech);
  return article;
}

async function loadProjects() {
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("Could not load projects");
    const projects = await response.json();
    projectsGrid.replaceChildren();
    if (!projects.length) {
      projectsGrid.textContent = "Projects will be added soon.";
      return;
    }
    projects.forEach(project => projectsGrid.appendChild(createProjectCard(project)));
  } catch (error) {
    projectsGrid.textContent = "Projects could not be loaded. Please refresh the page.";
    console.error(error);
  }
}

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm.addEventListener("submit", async event => {
  event.preventDefault();
  const submitButton = contactForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  const formData = Object.fromEntries(new FormData(contactForm).entries());
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to send message.");
    formStatus.textContent = result.message;
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = error.message;
    formStatus.style.color = "#ff9b9b";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send message <span>↗</span>';
  }
});

loadProjects();