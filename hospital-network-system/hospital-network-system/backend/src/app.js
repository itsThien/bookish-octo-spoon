import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';

const app = express();

// ===========================
// MIDDLEWARE
// ===========================

// Enable CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===========================
// API ROUTES
// ===========================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hospital Network Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HNMS API Documentation'
}));

// Auth routes
app.use('/api/auth', authRoutes);

// Patient routes
app.use('/api/patients', patientRoutes);

// Appointment routes
app.use('/api/appointments', appointmentRoutes);

// ===========================
// ERROR HANDLING
// ===========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
