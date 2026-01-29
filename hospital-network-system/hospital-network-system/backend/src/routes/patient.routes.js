import express from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientMedicalRecords,
  getPatientAppointments
} from '../controllers/patient.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients (with pagination and search)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 */
router.get('/', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), getAllPatients);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get('/:id', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), getPatientById);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *             properties:
 *               full_name:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               emergency_contact:
 *                 type: string
 *               blood_type:
 *                 type: string
 *               allergies:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient created successfully
 */
router.post('/', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), createPatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient updated successfully
 */
router.put('/:id', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 */
router.delete('/:id', allowRoles('SUPER_ADMIN', 'ADMIN'), deletePatient);

/**
 * @swagger
 * /api/patients/{id}/medical-records:
 *   get:
 *     summary: Get patient's medical records
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Medical records retrieved successfully
 */
router.get('/:id/medical-records', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), getPatientMedicalRecords);

/**
 * @swagger
 * /api/patients/{id}/appointments:
 *   get:
 *     summary: Get patient's appointments
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 */
router.get('/:id/appointments', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), getPatientAppointments);

export default router;
