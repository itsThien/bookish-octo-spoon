# 🚀 Deployment Guide

This guide covers deploying the Hospital Network Management System to production environments.

## Table of Contents
- [Heroku Deployment](#heroku-deployment)
- [AWS Deployment](#aws-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Security Checklist](#security-checklist)

---

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Heroku account created
- Git repository initialized

### Step-by-Step Deployment

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
heroku create hospital-network-api
```

3. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com
```

5. **Deploy Code**
```bash
git push heroku main
```

6. **Run Database Migrations**
```bash
heroku pg:psql < database/schema.sql
```

7. **Open Application**
```bash
heroku open
```

8. **View Logs**
```bash
heroku logs --tail
```

### Heroku Configuration

Create `Procfile` in project root:
```
web: node backend/src/server.js
```

Update `package.json`:
```json
{
  "scripts": {
    "start": "node backend/src/server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## AWS Deployment

### Architecture
- **Compute**: AWS EC2 or Elastic Beanstalk
- **Database**: Amazon RDS (PostgreSQL)
- **Load Balancer**: Application Load Balancer
- **Storage**: Amazon S3 (for file uploads)

### Step-by-Step Deployment

#### 1. Set Up RDS Database

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier hospital-network-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier hospital-network-db \
  --query 'DBInstances[0].Endpoint.Address'
```

#### 2. Deploy to EC2

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone repository
git clone https://github.com/yourusername/hospital-network-system.git
cd hospital-network-system/backend

# Install dependencies
npm install --production

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://admin:YourPassword@your-rds-endpoint:5432/hospital_network
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
PORT=5000
EOF

# Install PM2
sudo npm install -g pm2

# Start application
pm2 start src/server.js --name hospital-api

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 3. Set Up NGINX Reverse Proxy

```bash
sudo yum install nginx

# Configure NGINX
sudo nano /etc/nginx/nginx.conf
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Start NGINX
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 4. Set Up SSL with Let's Encrypt

```bash
sudo yum install certbot python3-certbot-nginx

sudo certbot --nginx -d api.yourdomain.com
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in backend directory:

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/server.js"]
```

### docker-compose.yml

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: hospital_network
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  api:
    build: ./backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/hospital_network
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
      PORT: 5000
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Create .env file
cat > .env << EOF
DB_PASSWORD=yourSecurePassword123
JWT_SECRET=$(openssl rand -hex 32)
EOF

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | Random 32+ character string |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |
| `LOG_LEVEL` | Logging level | `info` |
| `MAX_REQUEST_SIZE` | Max request body size | `10mb` |

### Generate Secure JWT Secret

```bash
# Using OpenSSL
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security Checklist

### Pre-Deployment

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Review and restrict IAM permissions
- [ ] Enable logging and monitoring

### Database Security

```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Restrict superuser access
ALTER USER postgres WITH PASSWORD 'new_secure_password';
```

### API Security Headers

Add to `app.js`:

```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Strict rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
app.use('/api/auth/login', authLimiter);
```

### Environment-Specific Configuration

```javascript
// config/production.js
export default {
  database: {
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DB_SSL_CERT
    },
    pool: {
      min: 2,
      max: 10
    }
  },
  jwt: {
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
  }
};
```

---

## Monitoring & Logging

### Set Up CloudWatch (AWS)

```bash
# Install CloudWatch agent
sudo yum install amazon-cloudwatch-agent

# Configure logging
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json \
  -s
```

### Application Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}
```

---

## Backup Strategy

### Automated Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -h your-db-host -U postgres hospital_network > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
rm backup_$DATE.sql

# Add to crontab
0 2 * * * /path/to/backup.sh
```

---

## Rollback Plan

```bash
# Keep previous version
git tag v1.0.0

# If issues occur, rollback
git checkout v1.0.0
pm2 restart hospital-api

# Or with Docker
docker-compose down
git checkout v1.0.0
docker-compose up -d
```

---

## Performance Optimization

### Database Indexing

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_appointments_time 
ON appointments(appointment_time) WHERE status = 'SCHEDULED';

CREATE INDEX CONCURRENTLY idx_patients_search 
ON patients(full_name, email);
```

### Connection Pooling

```javascript
const pool = new Pool({
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

**Your application is now production-ready!** 🎉

For support, consult the [README](README.md) or open an issue on GitHub.
