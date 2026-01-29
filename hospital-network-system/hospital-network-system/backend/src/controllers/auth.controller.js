import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';

/**
 * User Login
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required.' 
      });
    }

    // Find user by email
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials.' 
      });
    }

    const user = rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        message: 'Account is disabled. Please contact administrator.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials.' 
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      hospitalId: user.hospital_id
    });

    // Return user info (without password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hospitalId: user.hospital_id,
      phone: user.phone
    };

    res.json({ 
      success: true,
      message: 'Login successful.',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login.',
      error: error.message 
    });
  }
};

/**
 * User Registration
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, hospitalId, phone } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, password, and role are required.' 
      });
    }

    // Validate role
    const validRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already registered.' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (hospital_id, name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, hospital_id, phone, created_at`,
      [hospitalId || null, name, email.toLowerCase(), passwordHash, role, phone || null]
    );

    const newUser = result.rows[0];

    // Generate token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      hospitalId: newUser.hospital_id
    });

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        hospitalId: newUser.hospital_id,
        phone: newUser.phone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration.',
      error: error.message 
    });
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.is_active, 
              u.hospital_id, h.name as hospital_name, u.created_at
       FROM users u
       LEFT JOIN hospitals h ON u.hospital_id = h.id
       WHERE u.id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found.' 
      });
    }

    const user = rows[0];

    res.json({ 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.is_active,
        hospitalId: user.hospital_id,
        hospitalName: user.hospital_name,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving profile.',
      error: error.message 
    });
  }
};

/**
 * Update User Profile
 * PUT /api/auth/me
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, role, phone`,
      [name, phone, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found.' 
      });
    }

    res.json({ 
      success: true,
      message: 'Profile updated successfully.',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating profile.',
      error: error.message 
    });
  }
};

/**
 * Change Password
 * POST /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password and new password are required.' 
      });
    }

    // Get user
    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found.' 
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Current password is incorrect.' 
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ 
      success: true,
      message: 'Password changed successfully.' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error changing password.',
      error: error.message 
    });
  }
};
