# 📬 API Testing Guide

Complete guide for testing all API endpoints with examples.

## Authentication Flow

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "alice.nguyen@metrogeneral.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Dr. Alice Nguyen",
    "email": "alice.nguyen@metrogeneral.com",
    "role": "DOCTOR",
    "hospitalId": 1
  }
}
```

**Save the token!** Use it in the `Authorization` header for all subsequent requests:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Patient Management

### 2. Get All Patients

**Endpoint:** `GET /api/patients?page=1&limit=10`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "Michael Tran",
      "dob": "1998-04-21",
      "gender": "Male",
      "phone": "832-555-0192",
      "email": "michael.tran@email.com",
      "hospital_name": "Metro General Hospital"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 3. Create Patient

**Endpoint:** `POST /api/patients`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "full_name": "John Smith",
  "dob": "1990-05-15",
  "gender": "Male",
  "phone": "832-555-9999",
  "email": "john.smith@email.com",
  "address": "123 Main St, Houston, TX",
  "emergency_contact": "Jane Smith - 832-555-8888",
  "blood_type": "A+",
  "allergies": "None"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient created successfully.",
  "data": {
    "id": 7,
    "hospital_id": 1,
    "full_name": "John Smith",
    "dob": "1990-05-15",
    "gender": "Male",
    "phone": "832-555-9999",
    "email": "john.smith@email.com",
    "created_at": "2026-01-29T10:30:00.000Z"
  }
}
```

### 4. Get Patient Details

**Endpoint:** `GET /api/patients/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "hospital_id": 1,
    "full_name": "Michael Tran",
    "dob": "1998-04-21",
    "gender": "Male",
    "phone": "832-555-0192",
    "email": "michael.tran@email.com",
    "address": "123 Oak St, Houston, TX",
    "emergency_contact": "Sarah Tran - 832-555-0193",
    "blood_type": "O+",
    "allergies": "Penicillin",
    "hospital_name": "Metro General Hospital"
  }
}
```

### 5. Update Patient

**Endpoint:** `PUT /api/patients/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "phone": "832-555-1111",
  "email": "newemail@example.com"
}
```

### 6. Get Patient Medical Records

**Endpoint:** `GET /api/patients/1/medical-records`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient_id": 1,
      "doctor_id": 1,
      "doctor_name": "Dr. Alice Nguyen",
      "diagnosis": "Hypertension - Stage 1",
      "symptoms": "Elevated blood pressure, occasional headaches",
      "treatment": "Lifestyle modifications, medication",
      "prescription": "Lisinopril 10mg daily",
      "notes": "Patient advised to reduce sodium intake",
      "created_at": "2026-01-20T09:00:00.000Z"
    }
  ]
}
```

---

## Appointment Management

### 7. Create Appointment

**Endpoint:** `POST /api/appointments`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "patient_id": 1,
  "doctor_id": 1,
  "appointment_time": "2026-02-10T10:00:00",
  "duration_minutes": 30,
  "reason": "Annual checkup",
  "notes": "Patient requested morning slot"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully.",
  "data": {
    "id": 8,
    "patient_id": 1,
    "doctor_id": 1,
    "appointment_time": "2026-02-10T10:00:00.000Z",
    "duration_minutes": 30,
    "status": "SCHEDULED",
    "reason": "Annual checkup",
    "notes": "Patient requested morning slot",
    "created_at": "2026-01-29T10:45:00.000Z"
  }
}
```

### 8. Get All Appointments

**Endpoint:** `GET /api/appointments?status=SCHEDULED&date=2026-02-10`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (SCHEDULED, COMPLETED, CANCELLED)
- `doctorId`: Filter by doctor
- `patientId`: Filter by patient
- `date`: Filter by date (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 9. Get Doctor's Schedule

**Endpoint:** `GET /api/appointments/doctor/1/schedule?date=2026-02-10`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "appointment_time": "2026-02-10T09:00:00.000Z",
      "duration_minutes": 30,
      "status": "SCHEDULED",
      "patient_name": "Michael Tran",
      "reason": "Annual checkup"
    },
    {
      "id": 2,
      "appointment_time": "2026-02-10T10:00:00.000Z",
      "duration_minutes": 45,
      "status": "SCHEDULED",
      "patient_name": "Jennifer Smith",
      "reason": "Follow-up consultation"
    }
  ]
}
```

### 10. Update Appointment

**Endpoint:** `PUT /api/appointments/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "status": "COMPLETED",
  "notes": "Patient arrived on time. Checkup completed successfully."
}
```

### 11. Cancel Appointment

**Endpoint:** `DELETE /api/appointments/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully."
}
```

---

## User Profile Management

### 12. Get Current User Profile

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Dr. Alice Nguyen",
    "email": "alice.nguyen@metrogeneral.com",
    "role": "DOCTOR",
    "phone": "713-555-1001",
    "isActive": true,
    "hospitalId": 1,
    "hospitalName": "Metro General Hospital",
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
}
```

### 13. Update Profile

**Endpoint:** `PUT /api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Dr. Alice Nguyen-Chen",
  "phone": "713-555-2222"
}
```

### 14. Change Password

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newSecurePassword456"
}
```

---

## Error Responses

### Unauthorized (401)
```json
{
  "success": false,
  "message": "No token provided. Access denied."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Required roles: ADMIN, DOCTOR",
  "userRole": "NURSE"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Patient not found."
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Patient name is required."
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error during operation.",
  "error": "Connection timeout"
}
```

---

## Testing with cURL

### Complete Testing Flow

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice.nguyen@metrogeneral.com","password":"password123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 2. Get all patients
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer $TOKEN"

# 3. Create a patient
curl -X POST http://localhost:5000/api/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Patient",
    "dob": "1995-06-20",
    "gender": "Female",
    "phone": "832-555-0000"
  }'

# 4. Create appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "doctor_id": 1,
    "appointment_time": "2026-02-15T14:00:00",
    "reason": "Consultation"
  }'
```

---

## Postman Collection

You can import the Swagger JSON into Postman:

1. Visit http://localhost:5000/api/docs
2. Copy the Swagger JSON
3. In Postman: Import → Paste Raw Text → Import
4. Set up environment variable `baseUrl` = `http://localhost:5000`
5. Set up environment variable `token` = (your JWT token)

---

**Happy Testing!** 🧪
