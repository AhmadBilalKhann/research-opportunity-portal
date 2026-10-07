-- ===================================================
-- University Research Opportunity Portal
-- Database Schema Setup Script
-- ===================================================

-- Create database if it does not already exist
CREATE DATABASE IF NOT EXISTS research_opportunity_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE research_opportunity_db;

-- Create research_opportunities table
CREATE TABLE IF NOT EXISTS research_opportunities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  research_area VARCHAR(150) NOT NULL,
  faculty_name VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  required_skills TEXT NOT NULL,
  available_positions INT NOT NULL DEFAULT 1,
  application_deadline DATE NOT NULL,
  status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_available_positions CHECK (available_positions >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
