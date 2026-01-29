import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Network Management System API',
      version: '1.0.0',
      description: `
        A comprehensive Hospital Network Management System API with multi-hospital architecture,
        role-based access control, and JWT authentication.
        
        ## Features
        - Multi-hospital support with data isolation
        - Role-based access control (SUPER_ADMIN, ADMIN, DOCTOR, NURSE, PATIENT)
        - JWT authentication
        - Patient management
        - Appointment scheduling
        - Medical records
        
        ## Demo Credentials
        - **Admin**: admin@metrogeneral.com / password123
        - **Doctor**: alice.nguyen@metrogeneral.com / password123
        - **Nurse**: sarah.johnson@metrogeneral.com / password123
        - **Super Admin**: superadmin@hnms.com / password123
      `,
      contact: {
        name: 'Thien',
        email: 'thien@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            name: {
              type: 'string'
            },
            email: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'PATIENT']
            },
            hospitalId: {
              type: 'integer'
            },
            phone: {
              type: 'string'
            }
          }
        },
        Patient: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            hospital_id: {
              type: 'integer'
            },
            full_name: {
              type: 'string'
            },
            dob: {
              type: 'string',
              format: 'date'
            },
            gender: {
              type: 'string'
            },
            phone: {
              type: 'string'
            },
            email: {
              type: 'string'
            },
            address: {
              type: 'string'
            },
            blood_type: {
              type: 'string'
            },
            allergies: {
              type: 'string'
            }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            patient_id: {
              type: 'integer'
            },
            doctor_id: {
              type: 'integer'
            },
            appointment_time: {
              type: 'string',
              format: 'date-time'
            },
            status: {
              type: 'string',
              enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
            },
            reason: {
              type: 'string'
            },
            notes: {
              type: 'string'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and profile management'
      },
      {
        name: 'Patients',
        description: 'Patient management operations'
      },
      {
        name: 'Appointments',
        description: 'Appointment scheduling and management'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
