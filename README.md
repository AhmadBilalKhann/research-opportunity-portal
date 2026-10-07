# University Research Opportunity Portal

## GitHub Repository
https://github.com/AhmadBilalKhann/research-opportunity-portal

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
│   ├── config/
│   │   └── db.js             # MySQL database connection pool (mysql2)
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Node.js dependencies and scripts
│   └── server.js             # Express application entry point & static server
├── frontend/
│   ├── css/
│   │   └── style.css         # Frontend styling
│   ├── js/
│   │   └── app.js            # Client-side JavaScript logic
│   └── index.html            # Portal user interface
├── database/
│   ├── README.md             # Database setup guide and documentation
│   ├── schema.sql            # Database schema definitions and setup
│   └── seed.sql              # Optional initial sample research opportunities
├── postman/
│   └── README.md             # Postman / Newman collection exports
├── .gitignore                # Git ignore rules for node_modules, secrets, logs
└── README.md                 # Project documentation and instructions
```

---

## Getting Started (Setup & Execution)

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- MySQL Server (v8.0+ recommended)

### 2. Database Setup
```bash
# 1. Run schema script to create research_opportunity_db database and table
mysql -u root -p < database/schema.sql

# 2. (Optional) Populate initial sample research opportunities
mysql -u root -p < database/seed.sql
```

### 3. Backend Configuration & Execution
```bash
# Navigate to backend directory
cd backend

# Create .env from template and configure your MySQL credentials
cp .env.example .env

# Install dependencies (already installed during initialization)
npm install

# Start the unified server
npm start
```
By default, the unified server runs on `http://localhost:3000`.
- **Frontend interface:** Accessible directly at `http://localhost:3000`
- **Health check endpoint:** `http://localhost:3000/api/health`
