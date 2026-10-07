# Database Setup Instructions

This directory contains the database setup and initialization scripts for the **University Research Opportunity Portal**.

---

## 1. Files Overview

- **`schema.sql`** *(Required)*: Creates the database `research_opportunity_db` and the `research_opportunities` table with all necessary fields, data types, and integrity constraints.
- **`seed.sql`** *(Optional)*: Populates the database with 4 realistic research opportunities (covering AI, Computer Networks, Cybersecurity, and NLP).

---

## 2. Table Structure: `research_opportunities`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | `AUTO_INCREMENT`, `PRIMARY KEY` | Unique opportunity identifier |
| `title` | `VARCHAR(255)` | `NOT NULL` | Title of the research project |
| `description` | `TEXT` | `NOT NULL` | Detailed project description |
| `research_area` | `VARCHAR(150)` | `NOT NULL` | Research domain (e.g. AI, Networks) |
| `faculty_name` | `VARCHAR(150)` | `NOT NULL` | Name of the supervising faculty member |
| `department` | `VARCHAR(100)` | `NOT NULL` | Department offering the opportunity |
| `required_skills` | `TEXT` | `NOT NULL` | Prerequisite skills and tools needed |
| `available_positions` | `INT` | `NOT NULL`, `DEFAULT 1`, `CHECK >= 1` | Number of open positions |
| `application_deadline` | `DATE` | `NOT NULL` | Deadline in `YYYY-MM-DD` format |
| `status` | `ENUM('Open', 'Closed')` | `NOT NULL`, `DEFAULT 'Open'` | Current status of the opening |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Last updated timestamp |

---

## 3. How to Set Up the Database

### Option A: Using the MySQL Command Line Client (Terminal)

1. Open your terminal.
2. Log into MySQL:
   ```bash
   mysql -u root -p
   ```
   *(Enter your MySQL password when prompted)*

3. Run the schema script to create the database and table:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *Or from inside the MySQL shell:*
   ```sql
   SOURCE /path/to/CN_Assignment/database/schema.sql;
   ```

4. *(Optional)* Seed initial sample records:
   ```bash
   mysql -u root -p < database/seed.sql
   ```
   *Or from inside the MySQL shell:*
   ```sql
   SOURCE /path/to/CN_Assignment/database/seed.sql;
   ```

---

### Option B: Using MySQL Workbench or phpMyAdmin

1. Open **MySQL Workbench** or **phpMyAdmin**.
2. Connect to your local MySQL instance.
3. Open `database/schema.sql` and execute the query script.
4. *(Optional)* Open `database/seed.sql` and execute the query script to populate sample data.

---

## 4. How to Verify Database Setup

From the MySQL CLI or Workbench:

```sql
USE research_opportunity_db;

-- Check table schema
DESCRIBE research_opportunities;

-- Check sample records (if seeded)
SELECT id, title, faculty_name, department, status, application_deadline FROM research_opportunities;
```
