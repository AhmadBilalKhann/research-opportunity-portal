# University Research Opportunity Portal

## GitHub Repository
`https://github.com/username/research-opportunity-portal` *(Replace with actual repository URL upon push)*

---

## Project Description
The **University Research Opportunity Portal** is a centralized web-based platform designed to streamline how university faculty members publish and manage research opportunities and how students discover and apply for them. 

Currently, research openings are often distributed irregularly across emails, messaging groups, and physical noticeboards, causing students to miss important academic opportunities and faculty members to experience difficulty tracking applicants. This portal provides:
- A backend REST API for managing research opportunities (CRUD operations).
- A MySQL relational database for persistent storage.
- A clean, accessible frontend interface for interaction.

---

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6)
- **API Testing:** Postman / Newman
- **Version Control:** Git, GitHub

---

## Planned Project Structure

```text
CN_Assignment/
├── backend/
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Node.js dependencies and scripts
│   └── server.js             # Express application entry point
├── frontend/
│   ├── css/
│   │   └── style.css         # Frontend styling
│   ├── js/
│   │   └── app.js            # Client-side JavaScript logic
│   └── index.html            # Portal user interface
├── database/
│   └── schema.sql            # Database schema definitions and setup
├── postman/
│   └── README.md             # Postman / Newman collection exports
├── .env.example              # Root environment variables template
├── .gitignore                # Git ignore rules for node_modules, secrets, logs
└── README.md                 # Project documentation and instructions
```

---

## Getting Started (Initial Setup)

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- MySQL Server

### 2. Backend Installation & Run
```bash
# Navigate to backend directory
cd backend

# Install dependencies (already installed during initialization)
npm install

# Start the server
npm start
```
By default, the server will be available at `http://localhost:5000`.

### 3. Frontend
Open `frontend/index.html` directly in your web browser.
