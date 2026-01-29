import pool from '../config/db.js';

/**
 * Get All Patients (with hospital filtering)
 * GET /api/patients
 */
export const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, h.name as hospital_name
      FROM patients p
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE 1=1
    `;
    const queryParams = [];

    // Hospital isolation (except for super admins)
    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      queryParams.push(req.user.hospitalId);
      query += ` AND p.hospital_id = $${queryParams.length}`;
    }

    // Search filter
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (p.full_name ILIKE $${queryParams.length} OR p.email ILIKE $${queryParams.length})`;
    }

    // Get total count
    const countResult = await pool.query(
      query.replace('SELECT p.*, h.name as hospital_name', 'SELECT COUNT(*)'),
      queryParams
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    queryParams.push(limit, offset);
    query += ` ORDER BY p.created_at DESC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    const { rows } = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patients.',
      error: error.message
    });
  }
};

/**
 * Get Patient by ID
 * GET /api/patients/:id
 */
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT p.*, h.name as hospital_name
      FROM patients p
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE p.id = $1
    `;
    const queryParams = [id];

    // Hospital isolation
    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      queryParams.push(req.user.hospitalId);
      query += ` AND p.hospital_id = $${queryParams.length}`;
    }

    const { rows } = await pool.query(query, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient.',
      error: error.message
    });
  }
};

/**
 * Create New Patient
 * POST /api/patients
 */
export const createPatient = async (req, res) => {
  try {
    const {
      full_name,
      dob,
      gender,
      phone,
      email,
      address,
      emergency_contact,
      blood_type,
      allergies
    } = req.body;

    // Validation
    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: 'Patient name is required.'
      });
    }

    // Use user's hospital_id or allow super admin to specify
    const hospitalId = req.body.hospital_id || req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required.'
      });
    }

    const result = await pool.query(
      `INSERT INTO patients 
       (hospital_id, full_name, dob, gender, phone, email, address, emergency_contact, blood_type, allergies)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [hospitalId, full_name, dob, gender, phone, email, address, emergency_contact, blood_type, allergies]
    );

    res.status(201).json({
      success: true,
      message: 'Patient created successfully.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating patient.',
      error: error.message
    });
  }
};

/**
 * Update Patient
 * PUT /api/patients/:id
 */
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      dob,
      gender,
      phone,
      email,
      address,
      emergency_contact,
      blood_type,
      allergies
    } = req.body;

    // Check if patient exists and belongs to user's hospital
    let checkQuery = 'SELECT id FROM patients WHERE id = $1';
    const checkParams = [id];

    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      checkParams.push(req.user.hospitalId);
      checkQuery += ` AND hospital_id = $${checkParams.length}`;
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or access denied.'
      });
    }

    // Update patient
    const result = await pool.query(
      `UPDATE patients
       SET full_name = COALESCE($1, full_name),
           dob = COALESCE($2, dob),
           gender = COALESCE($3, gender),
           phone = COALESCE($4, phone),
           email = COALESCE($5, email),
           address = COALESCE($6, address),
           emergency_contact = COALESCE($7, emergency_contact),
           blood_type = COALESCE($8, blood_type),
           allergies = COALESCE($9, allergies),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [full_name, dob, gender, phone, email, address, emergency_contact, blood_type, allergies, id]
    );

    res.json({
      success: true,
      message: 'Patient updated successfully.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient.',
      error: error.message
    });
  }
};

/**
 * Delete Patient
 * DELETE /api/patients/:id
 */
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if patient exists and belongs to user's hospital
    let checkQuery = 'SELECT id FROM patients WHERE id = $1';
    const checkParams = [id];

    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      checkParams.push(req.user.hospitalId);
      checkQuery += ` AND hospital_id = $${checkParams.length}`;
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or access denied.'
      });
    }

    // Delete patient (cascade will handle related records)
    await pool.query('DELETE FROM patients WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Patient deleted successfully.'
    });

  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient.',
      error: error.message
    });
  }
};

/**
 * Get Patient's Medical History
 * GET /api/patients/:id/medical-records
 */
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify patient access
    let checkQuery = 'SELECT id FROM patients WHERE id = $1';
    const checkParams = [id];

    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      checkParams.push(req.user.hospitalId);
      checkQuery += ` AND hospital_id = $${checkParams.length}`;
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or access denied.'
      });
    }

    // Get medical records
    const { rows } = await pool.query(
      `SELECT mr.*, u.name as doctor_name
       FROM medical_records mr
       LEFT JOIN users u ON mr.doctor_id = u.id
       WHERE mr.patient_id = $1
       ORDER BY mr.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving medical records.',
      error: error.message
    });
  }
};

/**
 * Get Patient's Appointments
 * GET /api/patients/:id/appointments
 */
export const getPatientAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    // Verify patient access
    let checkQuery = 'SELECT id FROM patients WHERE id = $1';
    const checkParams = [id];

    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      checkParams.push(req.user.hospitalId);
      checkQuery += ` AND hospital_id = $${checkParams.length}`;
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or access denied.'
      });
    }

    // Get appointments
    let query = `
      SELECT a.*, u.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.patient_id = $1
    `;
    const queryParams = [id];

    if (status) {
      queryParams.push(status);
      query += ` AND a.status = $${queryParams.length}`;
    }

    query += ' ORDER BY a.appointment_time DESC';

    const { rows } = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointments.',
      error: error.message
    });
  }
};
