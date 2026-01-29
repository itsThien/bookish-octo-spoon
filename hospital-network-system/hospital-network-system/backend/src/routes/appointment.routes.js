import express from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getDoctorSchedule
} from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments (with filters)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 */
router.get('/', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), getAllAppointments);

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}/schedule:
 *   get:
 *     summary: Get doctor's schedule
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: week
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Doctor schedule retrieved successfully
 */
router.get('/doctor/:doctorId/schedule', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), getDoctorSchedule);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
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
 *         description: Appointment retrieved successfully
 */
router.get('/:id', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), getAppointmentById);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - doctor_id
 *               - appointment_time
 *             properties:
 *               patient_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               appointment_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-10T10:00:00"
 *               duration_minutes:
 *                 type: integer
 *                 default: 30
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */
router.post('/', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), createAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
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
 *         description: Appointment updated successfully
 */
router.put('/:id', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Cancel appointment
 *     tags: [Appointments]
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
 *         description: Appointment cancelled successfully
 */
router.delete('/:id', allowRoles('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'), cancelAppointment);

export default router;
