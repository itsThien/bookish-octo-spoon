import pool from '../config/db.js';

/**
 * Get All Appointments
 * GET /api/appointments
 */
export const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, doctorId, patientId, date } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, 
             p.full_name as patient_name,
             u.name as doctor_name,
             h.name as hospital_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE 1=1
    `;
    const queryParams = [];

    // Hospital filtering
    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      queryParams.push(req.user.hospitalId);
      query += ` AND p.hospital_id = $${queryParams.length}`;
    }

    // Role-based filtering
    if (req.user.role === 'DOCTOR') {
      queryParams.push(req.user.id);
      query += ` AND a.doctor_id = $${queryParams.length}`;
    }

    // Status filter
    if (status) {
      queryParams.push(status);
      query += ` AND a.status = $${queryParams.length}`;
    }

    // Doctor filter
    if (doctorId) {
      queryParams.push(doctorId);
      query += ` AND a.doctor_id = $${queryParams.length}`;
    }

    // Patient filter
    if (patientId) {
      queryParams.push(patientId);
      query += ` AND a.patient_id = $${queryParams.length}`;
    }

    // Date filter
    if (date) {
      queryParams.push(date);
      query += ` AND DATE(a.appointment_time) = $${queryParams.length}`;
    }

    // Get total count
    const countResult = await pool.query(
      query.replace('SELECT a.*, p.full_name as patient_name, u.name as doctor_name, h.name as hospital_name', 'SELECT COUNT(*)'),
      queryParams
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    queryParams.push(limit, offset);
    query += ` ORDER BY a.appointment_time DESC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

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
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointments.',
      error: error.message
    });
  }
};

/**
 * Get Appointment by ID
 * GET /api/appointments/:id
 */
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT a.*, 
             p.full_name as patient_name, p.dob as patient_dob, p.gender as patient_gender,
             p.phone as patient_phone, p.email as patient_email,
             u.name as doctor_name, u.email as doctor_email,
             h.name as hospital_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE a.id = $1
    `;
    const queryParams = [id];

    // Hospital filtering
    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      queryParams.push(req.user.hospitalId);
      query += ` AND p.hospital_id = $${queryParams.length}`;
    }

    // Role-based filtering
    if (req.user.role === 'DOCTOR') {
      queryParams.push(req.user.id);
      query += ` AND a.doctor_id = $${queryParams.length}`;
    }

    const { rows } = await pool.query(query, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or access denied.'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointment.',
      error: error.message
    });
  }
};

/**
 * Create New Appointment
 * POST /api/appointments
 */
export const createAppointment = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      appointment_time,
      duration_minutes = 30,
      reason,
      notes
    } = req.body;

    // Validation
    if (!patient_id || !doctor_id || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, Doctor ID, and appointment time are required.'
      });
    }

    // Verify patient exists and belongs to hospital
    let patientQuery = 'SELECT id, hospital_id FROM patients WHERE id = $1';
    const patientParams = [patient_id];

    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      patientParams.push(req.user.hospitalId);
      patientQuery += ` AND hospital_id = $${patientParams.length}`;
    }

    const patientResult = await pool.query(patientQuery, patientParams);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or access denied.'
      });
    }

    // Verify doctor exists
    const doctorResult = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'DOCTOR'",
      [doctor_id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    // Check for scheduling conflicts
    const conflictCheck = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 
       AND status = 'SCHEDULED'
       AND appointment_time = $2`,
      [doctor_id, appointment_time]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Doctor already has an appointment at this time.'
      });
    }

    // Create appointment
    const result = await pool.query(
      `INSERT INTO appointments 
       (patient_id, doctor_id, appointment_time, duration_minutes, status, reason, notes)
       VALUES ($1, $2, $3, $4, 'SCHEDULED', $5, $6)
       RETURNING *`,
      [patient_id, doctor_id, appointment_time, duration_minutes, reason, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment.',
      error: error.message
    });
  }
};

/**
 * Update Appointment
 * PUT /api/appointments/:id
 */
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      appointment_time,
      duration_minutes,
      status,
      reason,
      notes
    } = req.body;

    // Check if appointment exists
    let checkQuery = `
      SELECT a.id, a.doctor_id, p.hospital_id 
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $1
    `;
    const checkParams = [id];

    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      checkParams.push(req.user.hospitalId);
      checkQuery += ` AND p.hospital_id = $${checkParams.length}`;
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or access denied.'
      });
    }

    // If rescheduling, check for conflicts
    if (appointment_time) {
      const conflictCheck = await pool.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = $1 
         AND status = 'SCHEDULED'
         AND appointment_time = $2
         AND id != $3`,
        [checkResult.rows[0].doctor_id, appointment_time, id]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Doctor already has an appointment at this time.'
        });
      }
    }

    // Update appointment
    const result = await pool.query(
      `UPDATE appointments
       SET appointment_time = COALESCE($1, appointment_time),
           duration_minutes = COALESCE($2, duration_minutes),
           status = COALESCE($3, status),
           reason = COALESCE($4, reason),
           notes = COALESCE($5, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [appointment_time, duration_minutes, status, reason, notes, id]
    );

    res.json({
      success: true,
      message: 'Appointment updated successfully.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment.',
      error: error.message
    });
  }
};

/**
 * Cancel Appointment
 * DELETE /api/appointments/:id
 */
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment exists
    let checkQuery = `
      SELECT a.id FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $1
    `;
    const checkParams = [id];

    if (req.user.role !== 'SUPER_ADMIN' && req.user.hospitalId) {
      checkParams.push(req.user.hospitalId);
      checkQuery += ` AND p.hospital_id = $${checkParams.length}`;
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or access denied.'
      });
    }

    // Update status to CANCELLED instead of deleting
    await pool.query(
      "UPDATE appointments SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    res.json({
      success: true,
      message: 'Appointment cancelled successfully.'
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment.',
      error: error.message
    });
  }
};

/**
 * Get Doctor's Schedule
 * GET /api/appointments/doctor/:doctorId/schedule
 */
export const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, week } = req.query;

    let query = `
      SELECT a.*, p.full_name as patient_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = $1 AND a.status = 'SCHEDULED'
    `;
    const queryParams = [doctorId];

    if (date) {
      queryParams.push(date);
      query += ` AND DATE(a.appointment_time) = $${queryParams.length}`;
    } else if (week) {
      // Get appointments for the week starting from the given date
      queryParams.push(week);
      query += ` AND a.appointment_time >= $${queryParams.length}::date 
                 AND a.appointment_time < ($${queryParams.length}::date + INTERVAL '7 days')`;
    }

    query += ' ORDER BY a.appointment_time ASC';

    const { rows } = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Get doctor schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving doctor schedule.',
      error: error.message
    });
  }
};
