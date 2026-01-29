-- ================================================
-- HOSPITAL NETWORK MANAGEMENT SYSTEM - DATABASE SCHEMA
-- PostgreSQL 14+
-- ================================================

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;

-- ================================================
-- TABLE: hospitals
-- ================================================
CREATE TABLE hospitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: users
-- ================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) CHECK (role IN ('SUPER_ADMIN','ADMIN','DOCTOR','NURSE','PATIENT')) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_users_hospital ON users(hospital_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ================================================
-- TABLE: patients
-- ================================================
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
  full_name VARCHAR(120) NOT NULL,
  dob DATE,
  gender VARCHAR(10) CHECK (gender IN ('Male','Female','Other')),
  phone VARCHAR(20),
  email VARCHAR(120),
  address TEXT,
  emergency_contact TEXT,
  blood_type VARCHAR(5),
  allergies TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_hospital ON patients(hospital_id);
CREATE INDEX idx_patients_name ON patients(full_name);

-- ================================================
-- TABLE: appointments
-- ================================================
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id),
  appointment_time TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(20) CHECK (status IN ('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW')) DEFAULT 'SCHEDULED',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_time ON appointments(appointment_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ================================================
-- TABLE: medical_records
-- ================================================
CREATE TABLE medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id),
  appointment_id INTEGER REFERENCES appointments(id),
  diagnosis TEXT NOT NULL,
  symptoms TEXT,
  treatment TEXT,
  prescription TEXT,
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);

-- ================================================
-- SEED DATA FOR DEMO
-- ================================================

-- Insert Hospitals
INSERT INTO hospitals (name, address, phone, email) VALUES
('Metro General Hospital', '1234 Medical Center Blvd, Houston, TX 77030', '713-555-0101', 'info@metrogeneral.com'),
('City Medical Center', '5678 Healthcare Ave, Houston, TX 77002', '713-555-0202', 'contact@citymedical.com'),
('Community Health Hospital', '9012 Wellness Dr, Houston, TX 77005', '713-555-0303', 'hello@communityhealth.com');

-- Insert Users (Password is 'password123' hashed with bcrypt)
-- Note: In production, hash these properly using bcrypt.hash()
INSERT INTO users (hospital_id, name, email, password_hash, role, phone) VALUES
-- Metro General Hospital Staff
(1, 'Dr. Alice Nguyen', 'alice.nguyen@metrogeneral.com', '$2b$10$rGHEq5K5h8qLGPFLlqP7gO0V.Z5P1h3yDMJ4zxQ2kRl8lZvJXBGIO', 'DOCTOR', '713-555-1001'),
(1, 'Dr. Robert Chen', 'robert.chen@metrogeneral.com', '$2b$10$rGHEq5K5h8qLGPFLlqP7gO0V.Z5P1h3yDMJ4zxQ2kRl8lZvJXBGIO', 'DOCTOR', '713-555-1002'),
(1, 'Nurse Sarah Johnson', 'sarah.johnson@metrogeneral.com', '$2b$10$rGHEq5K5h8qLGPFLlqP7gO0V.Z5P1h3yDMJ4zxQ2kRl8lZvJXBGIO', 'NURSE', '713-555-1003'),
(1, 'John Admin', 'admin@metrogeneral.com', '$2b$10$rGHEq5K5h8qLGPFLlqP7gO0V.Z5P1h3yDMJ4zxQ2kRl8lZvJXBGIO', 'ADMIN', '713-555-1000'),

-- City Medical Center Staff
(2, 'Dr. Maria Rodriguez', 'maria.rodriguez@citymedical.com', '$2b$10$rGHEq5K5h8qLGPFLlqP7gO0V.Z5P1h3yDMJ4zxQ2kRl8lZvJXBGIO', 'DOCTOR', '713-555-2001'),
(2, 'Nurse David Kim', 'david.kim@citymedical.com', '$2b$10$rGHEq5K5h8qLGPFLlqP7gO0V.Z5P1h3yDMJ4zxQ2kRl8lZvJXBGIO', 'NURSE', '713-555-2002'),
(2, 'Emily Admin', 'admin@citymedical.com', '$2b$10$rGHEq5K5h8qLGPFLlqP7gO0V.Z5P1h3yDMJ4zxQ2kRl8lZvJXBGIO', 'ADMIN', '713-555-2000'),

-- Super Admin (Access to all hospitals)
(NULL, 'System Administrator', 'superadmin@hnms.com', '$2b$10$rGHEq5K5h8qLGPFLlqP7gO0V.Z5P1h3yDMJ4zxQ2kRl8lZvJXBGIO', 'SUPER_ADMIN', '713-555-0000');

-- Insert Patients
INSERT INTO patients (hospital_id, full_name, dob, gender, phone, email, address, blood_type, allergies) VALUES
-- Metro General Patients
(1, 'Michael Tran', '1998-04-21', 'Male', '832-555-0192', 'michael.tran@email.com', '123 Oak St, Houston, TX', 'O+', 'Penicillin'),
(1, 'Jennifer Smith', '1985-08-15', 'Female', '832-555-0193', 'jennifer.smith@email.com', '456 Pine Ave, Houston, TX', 'A+', 'None'),
(1, 'Carlos Martinez', '1992-11-30', 'Male', '832-555-0194', 'carlos.martinez@email.com', '789 Elm Dr, Houston, TX', 'B-', 'Latex'),
(1, 'Lisa Wong', '2005-03-12', 'Female', '832-555-0195', 'lisa.wong@email.com', '321 Maple Ln, Houston, TX', 'AB+', 'Sulfa drugs'),

-- City Medical Patients
(2, 'David Johnson', '1978-06-25', 'Male', '832-555-0196', 'david.johnson@email.com', '654 Cedar Rd, Houston, TX', 'O-', 'None'),
(2, 'Patricia Lee', '1990-12-08', 'Female', '832-555-0197', 'patricia.lee@email.com', '987 Birch Ct, Houston, TX', 'A-', 'Aspirin');

-- Insert Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_time, status, reason) VALUES
-- Metro General Appointments
(1, 1, '2026-02-05 09:00:00', 'SCHEDULED', 'Annual checkup'),
(2, 1, '2026-02-05 10:00:00', 'SCHEDULED', 'Follow-up consultation'),
(3, 2, '2026-02-06 14:00:00', 'SCHEDULED', 'Lab results review'),
(1, 1, '2026-01-20 09:00:00', 'COMPLETED', 'Initial consultation'),
(4, 2, '2026-01-25 11:00:00', 'COMPLETED', 'Vaccination'),

-- City Medical Appointments
(5, 5, '2026-02-07 10:00:00', 'SCHEDULED', 'Physical examination'),
(6, 5, '2026-02-08 15:00:00', 'SCHEDULED', 'Chronic pain management');

-- Insert Medical Records
INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, symptoms, treatment, prescription, notes) VALUES
(1, 1, 4, 'Hypertension - Stage 1', 'Elevated blood pressure, occasional headaches', 'Lifestyle modifications, medication', 'Lisinopril 10mg daily', 'Patient advised to reduce sodium intake and increase physical activity. Follow-up in 3 months.'),
(4, 2, 5, 'Routine immunization', 'None - preventive care', 'Administered flu vaccine', 'N/A', 'No adverse reactions observed. Patient tolerated vaccine well.'),
(2, 1, NULL, 'Type 2 Diabetes Mellitus', 'Increased thirst, frequent urination, fatigue', 'Dietary management, oral hypoglycemic', 'Metformin 500mg twice daily', 'HbA1c: 7.8%. Patient referred to dietitian for meal planning.');

-- ================================================
-- DEMO CREDENTIALS
-- ================================================
-- Email: admin@metrogeneral.com | Password: password123 | Role: ADMIN
-- Email: alice.nguyen@metrogeneral.com | Password: password123 | Role: DOCTOR
-- Email: sarah.johnson@metrogeneral.com | Password: password123 | Role: NURSE
-- Email: superadmin@hnms.com | Password: password123 | Role: SUPER_ADMIN
-- ================================================

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Sample data inserted for testing.';
  RAISE NOTICE 'Use demo credentials from comments above to test authentication.';
END $$;
