# 🚀 Quick Start Guide

This guide will help you get the Hospital Network Management System up and running in under 10 minutes.

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed (`psql --version`)
- [ ] Git installed
- [ ] A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Database Setup (2 minutes)

```bash
# Create database
createdb hospital_network

# Import schema and seed data
psql -d hospital_network -f database/schema.sql
```

You should see: `Database schema created successfully!`

### 2. Backend Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `.env` file:**
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hospital_network
JWT_SECRET=mysupersecretkey123
PORT=5000
NODE_ENV=development
```

### 3. Start the Server (1 minute)

```bash
npm run dev
```

You should see:
```
✅ Database connection established
🏥 Hospital Network Management System (HNMS)
Server running on: http://localhost:5000
API Documentation: http://localhost:5000/api/docs
```

### 4. Test the API (2 minutes)

**Option A: Using Browser**
1. Open `http://localhost:5000/api/docs`
2. Click "Authorize" button
3. Login with: `alice.nguyen@metrogeneral.com` / `password123`
4. Copy the token
5. Paste in Authorization field
6. Try any endpoint!

**Option B: Using cURL**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice.nguyen@metrogeneral.com","password":"password123"}'

# Copy the token from response
# Use it in subsequent requests:
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues & Solutions

### Issue 1: Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Start PostgreSQL service
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL from Services
```

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in `.env` file to 5001 or kill the process using port 5000

### Issue 3: JWT_SECRET Not Found
```
Error: JWT_SECRET is not defined
```
**Solution**: Make sure `.env` file exists in backend folder and contains JWT_SECRET

## Next Steps

1. **Explore the API**: Visit http://localhost:5000/api/docs
2. **Test with Postman**: Import the Swagger JSON into Postman
3. **Build the Frontend**: Follow the frontend setup guide (coming soon)
4. **Customize**: Add your own features and endpoints

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Doctor | alice.nguyen@metrogeneral.com | password123 |
| Admin | admin@metrogeneral.com | password123 |
| Nurse | sarah.johnson@metrogeneral.com | password123 |
| Super Admin | superadmin@hnms.com | password123 |

## Useful Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# View logs
tail -f logs/server.log

# Reset database
psql -d hospital_network -f database/schema.sql
```

## Need Help?

- Check the [main README](README.md) for detailed documentation
- Review API docs at http://localhost:5000/api/docs
- Check [Common Issues](TROUBLESHOOTING.md)

---

**Ready to code!** 🎉 Your Hospital Network Management System is now running!
