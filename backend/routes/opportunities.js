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

// =========================================================================
// 4. PUT /api/opportunities/:id
// Update an existing research opportunity (supports partial & full updates)
// =========================================================================
router.put('/:id', async (req, res) => {
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

    // Check for empty body
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body cannot be empty. Please provide at least one field to update.'
      });
    }

    // Extract potential update fields
    const {
      title,
      description,
      department,
      status
    } = req.body;

    const research_area = req.body.research_area !== undefined ? req.body.research_area : req.body.researchArea;
    const faculty_name = req.body.faculty_name !== undefined ? req.body.faculty_name : (req.body.facultyName !== undefined ? req.body.facultyName : req.body.faculty_member_name);
    const required_skills = req.body.required_skills !== undefined ? req.body.required_skills : req.body.requiredSkills;
    const available_positions = req.body.available_positions !== undefined ? req.body.available_positions : req.body.availablePositions;
    const application_deadline = req.body.application_deadline !== undefined ? req.body.application_deadline : req.body.applicationDeadline;

    // Check if any recognized field was supplied
    const hasAnyField = (
      title !== undefined ||
      description !== undefined ||
      research_area !== undefined ||
      faculty_name !== undefined ||
      department !== undefined ||
      required_skills !== undefined ||
      available_positions !== undefined ||
      application_deadline !== undefined ||
      status !== undefined
    );

    if (!hasAnyField) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.'
      });
    }

    // Validate provided fields
    const errors = [];

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        errors.push('Research title must be a non-empty string.');
      }
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        errors.push('Research description must be a non-empty string.');
      }
    }

    if (research_area !== undefined) {
      if (typeof research_area !== 'string' || !research_area.trim()) {
        errors.push('Research area must be a non-empty string.');
      }
    }

    if (faculty_name !== undefined) {
      if (typeof faculty_name !== 'string' || !faculty_name.trim()) {
        errors.push("Faculty member's name must be a non-empty string.");
      }
    }

    if (department !== undefined) {
      if (typeof department !== 'string' || !department.trim()) {
        errors.push('Department must be a non-empty string.');
      }
    }

    if (required_skills !== undefined) {
      if (typeof required_skills !== 'string' || !required_skills.trim()) {
        errors.push('Required skills must be a non-empty string.');
      }
    }

    if (available_positions !== undefined) {
      const positionsNum = Number(available_positions);
      if (!Number.isInteger(positionsNum) || positionsNum <= 0) {
        errors.push('Available positions must be a positive integer greater than 0.');
      }
    }

    if (application_deadline !== undefined) {
      if (!isValidDateString(application_deadline)) {
        errors.push('Application deadline must be a valid date in YYYY-MM-DD format.');
      }
    }

    if (status !== undefined) {
      if (status !== 'Open' && status !== 'Closed') {
        errors.push('Status must be either "Open" or "Closed".');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Check if the record exists in MySQL
    const [existingRows] = await pool.execute(
      'SELECT id FROM research_opportunities WHERE id = ?',
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity with ID ${id} not found.`
      });
    }

    // Build dynamic UPDATE query with parameterized values
    const updateClauses = [];
    const updateValues = [];

    if (title !== undefined) {
      updateClauses.push('title = ?');
      updateValues.push(title.trim());
    }
    if (description !== undefined) {
      updateClauses.push('description = ?');
      updateValues.push(description.trim());
    }
    if (research_area !== undefined) {
      updateClauses.push('research_area = ?');
      updateValues.push(research_area.trim());
    }
    if (faculty_name !== undefined) {
      updateClauses.push('faculty_name = ?');
      updateValues.push(faculty_name.trim());
    }
    if (department !== undefined) {
      updateClauses.push('department = ?');
      updateValues.push(department.trim());
    }
    if (required_skills !== undefined) {
      updateClauses.push('required_skills = ?');
      updateValues.push(required_skills.trim());
    }
    if (available_positions !== undefined) {
      updateClauses.push('available_positions = ?');
      updateValues.push(Number(available_positions));
    }
    if (application_deadline !== undefined) {
      updateClauses.push('application_deadline = ?');
      updateValues.push(application_deadline.trim());
    }
    if (status !== undefined) {
      updateClauses.push('status = ?');
      updateValues.push(status);
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE research_opportunities SET ${updateClauses.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Retrieve and return the updated opportunity
    const [updatedRows] = await pool.execute(
      'SELECT * FROM research_opportunities WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Research opportunity updated successfully',
      data: updatedRows[0]
    });
  } catch (error) {
    console.error('Error updating research opportunity:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating research opportunity',
      error: error.message
    });
  }
});

// =========================================================================
// 5. DELETE /api/opportunities/:id
// Delete a research opportunity by its ID
// =========================================================================
router.delete('/:id', async (req, res) => {
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

    // Execute delete using parameterized prepared query
    const [result] = await pool.execute(
      'DELETE FROM research_opportunities WHERE id = ?',
      [id]
    );

    // If no row was affected, the opportunity did not exist
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Research opportunity with ID ${id} deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting research opportunity:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting research opportunity',
      error: error.message
    });
  }
});

module.exports = router;
