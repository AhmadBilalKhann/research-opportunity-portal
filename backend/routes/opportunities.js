const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Helper to validate date string in YYYY-MM-DD format
function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateStr;
}

// =========================================================================
// 1. POST /api/opportunities
// Create and store a new research opportunity
// =========================================================================
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      status = 'Open'
    } = req.body;

    // Handle flexible field naming (snake_case and camelCase)
    const research_area = req.body.research_area || req.body.researchArea;
    const faculty_name = req.body.faculty_name || req.body.facultyName || req.body.faculty_member_name;
    const required_skills = req.body.required_skills || req.body.requiredSkills;
    const available_positions = req.body.available_positions !== undefined ? req.body.available_positions : req.body.availablePositions;
    const application_deadline = req.body.application_deadline || req.body.applicationDeadline;

    // Validation checks
    const errors = [];

    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push('Research title is required and must not be empty.');
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      errors.push('Research description is required and must not be empty.');
    }
    if (!research_area || typeof research_area !== 'string' || !research_area.trim()) {
      errors.push('Research area is required and must not be empty.');
    }
    if (!faculty_name || typeof faculty_name !== 'string' || !faculty_name.trim()) {
      errors.push("Faculty member's name is required and must not be empty.");
    }
    if (!department || typeof department !== 'string' || !department.trim()) {
      errors.push('Department is required and must not be empty.');
    }
    if (!required_skills || typeof required_skills !== 'string' || !required_skills.trim()) {
      errors.push('Required skills are required and must not be empty.');
    }

    // Number of available positions validation
    if (available_positions === undefined || available_positions === null || available_positions === '') {
      errors.push('Number of available positions is required.');
    } else {
      const positionsNum = Number(available_positions);
      if (!Number.isInteger(positionsNum) || positionsNum <= 0) {
        errors.push('Available positions must be a positive integer greater than 0.');
      }
    }

    // Application deadline validation
    if (!application_deadline) {
      errors.push('Application deadline is required.');
    } else if (!isValidDateString(application_deadline)) {
      errors.push('Application deadline must be a valid date in YYYY-MM-DD format.');
    }

    // Status validation
    if (status !== 'Open' && status !== 'Closed') {
      errors.push('Status must be either "Open" or "Closed".');
    }

    // Return 400 Bad Request if validation fails
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Insert new opportunity using prepared statement
    const [result] = await pool.execute(
      `INSERT INTO research_opportunities 
        (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        research_area.trim(),
        faculty_name.trim(),
        department.trim(),
        required_skills.trim(),
        Number(available_positions),
        application_deadline.trim(),
        status
      ]
    );

    // Fetch and return created record
    const [rows] = await pool.execute(
      'SELECT * FROM research_opportunities WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Research opportunity created successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating research opportunity:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating research opportunity',
      error: error.message
    });
  }
});

// =========================================================================
// 2. GET /api/opportunities
// Retrieve all research opportunities
// =========================================================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM research_opportunities ORDER BY id ASC');

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error retrieving research opportunities:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving research opportunities',
      error: error.message
    });
  }
});

// =========================================================================
// 3. GET /api/opportunities/:id
// Retrieve one research opportunity by its ID
// =========================================================================
router.get('/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const id = Number(rawId);

    // Validate ID: must be a positive integer
    if (!/^\d+$/.test(rawId) || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID. ID must be a positive integer.'
      });
    }

    // Query opportunity by ID using parameterized prepared statement
    const [rows] = await pool.execute(
      'SELECT * FROM research_opportunities WHERE id = ?',
      [id]
    );

    // Check if opportunity exists
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error retrieving research opportunity by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving research opportunity',
      error: error.message
    });
  }
});

module.exports = router;
