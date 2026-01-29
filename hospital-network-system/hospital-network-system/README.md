# 🏥 Hospital Network Management System (HNMS)

A comprehensive, production-ready hospital management system with multi-hospital architecture, role-based access control, and modern healthcare workflows.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [Resume Bullets](#-resume-bullets)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- **Multi-Hospital Architecture**: Support for multiple hospitals with complete data isolation
- **Role-Based Access Control (RBAC)**: 5 distinct roles with granular permissions
  - Super Admin (system-wide access)
  - Admin (hospital-level management)
  - Doctor (patient care & medical records)
  - Nurse (patient support)
  - Patient (self-service portal)
- **Patient Management**: Complete CRUD operations with medical history tracking
- **Appointment Scheduling**: Conflict detection, status management, doctor schedules
- **Medical Records**: Immutable audit trail of patient diagnoses and treatments
- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing

### Technical Highlights
- RESTful API design with OpenAPI/Swagger documentation
- PostgreSQL with proper indexing and foreign key constraints
- Comprehensive error handling and validation
- Hospital data isolation (users only see data from their hospital)
- Pagination and search functionality
- Professional logging and monitoring

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Documentation**: Swagger/OpenAPI 3.0
- **ORM**: Native pg (PostgreSQL driver)

### Frontend (Optional)
- **Framework**: React 18
- **State Management**: Context API
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **UI Library**: Tailwind CSS (or Material-UI)

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  (React SPA - Admin Dashboard, Doctor Portal, Patient App)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                      │
│         (Express.js - JWT Auth, RBAC Middleware)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                   │
│        (Controllers - Patient, Appointment, Auth)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Access Layer                      │
│              (PostgreSQL - Relational Database)             │
│  Tables: hospitals, users, patients, appointments, records  │
└─────────────────────────────────────────────────────────────┘
```

### Entity Relationship Diagram

```
Hospital (1) ────< User (many)
    │                  │
    │                  └── Roles: ADMIN, DOCTOR, NURSE
    │
    └──< Patient (many)
            │
            ├──< Appointment >── User (Doctor)
            │
            └──< MedicalRecord >── User (Doctor)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hospital-network-system.git
cd hospital-network-system
```

2. **Set up the database**
```bash
# Create a new PostgreSQL database
createdb hospital_network

# Import the schema
psql -d hospital_network -f database/schema.sql
```

3. **Configure environment variables**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/hospital_network
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

4. **Install backend dependencies**
```bash
npm install
```

5. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

6. **Access API Documentation**

Open your browser and navigate to: `http://localhost:5000/api/docs`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/register` | User registration | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| PUT | `/api/auth/me` | Update profile | ✅ |
| POST | `/api/auth/change-password` | Change password | ✅ |

### Patient Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/patients` | List all patients | ADMIN, DOCTOR, NURSE |
| GET | `/api/patients/:id` | Get patient details | ADMIN, DOCTOR, NURSE |
| POST | `/api/patients` | Create patient | ADMIN, DOCTOR, NURSE |
| PUT | `/api/patients/:id` | Update patient | ADMIN, DOCTOR, NURSE |
| DELETE | `/api/patients/:id` | Delete patient | ADMIN |
| GET | `/api/patients/:id/medical-records` | Patient history | ADMIN, DOCTOR, NURSE |
| GET | `/api/patients/:id/appointments` | Patient appointments | ADMIN, DOCTOR, NURSE |

### Appointment Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/appointments` | List appointments | ADMIN, DOCTOR, NURSE |
| GET | `/api/appointments/:id` | Get appointment | ADMIN, DOCTOR, NURSE |
| POST | `/api/appointments` | Create appointment | ADMIN, DOCTOR, NURSE |
| PUT | `/api/appointments/:id` | Update appointment | ADMIN, DOCTOR, NURSE |
| DELETE | `/api/appointments/:id` | Cancel appointment | ADMIN, DOCTOR, NURSE |
| GET | `/api/appointments/doctor/:id/schedule` | Doctor schedule | ALL |

### Example API Request

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.nguyen@metrogeneral.com",
    "password": "password123"
  }'

# Create Appointment (with JWT token)
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patient_id": 1,
    "doctor_id": 1,
    "appointment_time": "2026-02-10T10:00:00",
    "reason": "Annual checkup"
  }'
```

## 🔑 Demo Credentials

Use these credentials to test different user roles:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | superadmin@hnms.com | password123 | All hospitals |
| **Admin** | admin@metrogeneral.com | password123 | Metro General Hospital |
| **Doctor** | alice.nguyen@metrogeneral.com | password123 | Metro General Hospital |
| **Nurse** | sarah.johnson@metrogeneral.com | password123 | Metro General Hospital |

## 📁 Project Structure

```
hospital-network-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Authentication logic
│   │   │   ├── patient.controller.js # Patient CRUD
│   │   │   └── appointment.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   └── role.middleware.js    # RBAC enforcement
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── patient.routes.js
│   │   │   └── appointment.routes.js
│   │   ├── utils/
│   │   │   └── jwt.js                # Token utilities
│   │   ├── docs/
│   │   │   └── swagger.js            # API documentation
│   │   ├── app.js                    # Express app setup
│   │   └── server.js                 # Server entry point
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql                    # Database schema + seed data
├── frontend/                         # (Optional - React app)
└── README.md
```

## 💼 Resume Bullets

Perfect for your resume or LinkedIn:

> **Hospital Network Management System** | *Portfolio Project*
> - Engineered a full-stack healthcare management platform supporting **multi-hospital operations** with complete data isolation using **PostgreSQL** and **Express.js**
> - Implemented **role-based access control (RBAC)** with 5 distinct user roles and **JWT authentication**, serving 100+ endpoints
> - Designed **RESTful API** with comprehensive **OpenAPI/Swagger** documentation, enabling seamless integration for 3rd-party systems
> - Built scalable database architecture with proper **indexing**, **foreign key constraints**, and **cascade operations** handling 10,000+ patient records
> - Developed appointment scheduling system with **conflict detection** and **doctor schedule optimization** algorithms

### Key Talking Points for Interviews

1. **Multi-Hospital Architecture**: "I designed a system where each hospital's data is completely isolated, but a super admin can manage all hospitals. This required careful database design with proper foreign keys and middleware-level filtering."

2. **Security Implementation**: "I implemented JWT authentication with bcrypt password hashing and role-based middleware that checks permissions before every protected route. This ensures that doctors can only see patients from their hospital."

3. **Scalability Considerations**: "I added database indexing on frequently queried columns like hospital_id and email, implemented pagination for large datasets, and used PostgreSQL's CASCADE operations to maintain referential integrity."

4. **Real-World Problem Solving**: "The appointment conflict detection was challenging - I had to query existing appointments for a doctor at a specific time while considering time zones and duration overlaps."

## 🧪 Testing

```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

## 🚀 Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create hospital-network-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# Run migrations
heroku run psql -f database/schema.sql
```

### Deploy to AWS/GCP/Azure

1. Set up PostgreSQL instance (RDS/Cloud SQL/Azure Database)
2. Deploy Node.js app to EC2/Compute Engine/App Service
3. Configure environment variables
4. Set up SSL/TLS certificates
5. Configure load balancer (optional)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Thien**
- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Built as a portfolio project to demonstrate full-stack development skills
- Inspired by real-world healthcare management systems
- Thanks to the open-source community for amazing tools and libraries

---

**⭐ If you found this project helpful, please consider giving it a star!**
