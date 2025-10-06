# Setup Guide

## Prerequisites

### Required Software
- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (comes with Node.js)
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop/))
- Git ([Download](https://git-scm.com/))

### Optional (for non-Docker setup)
- PostgreSQL 16 ([Download](https://www.postgresql.org/download/))
- Redis ([Download](https://redis.io/download/))

### External Services (Required for Production)
- Stripe Account (UK) - [Sign up](https://stripe.com/gb)
- AWS Account - [Sign up](https://aws.amazon.com/)
- Twilio Account - [Sign up](https://www.twilio.com/)

---

## Local Development Setup (Docker - Recommended)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd arteze-professional-service
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=3000

# Database (Docker)
DATABASE_URL=postgresql://flexstaff_user:flexstaff_pass@postgres:5432/flexstaff_db
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flexstaff_db
DB_USER=flexstaff_user
DB_PASSWORD=flexstaff_pass

# Redis (Docker)
REDIS_URL=redis://redis:6379

# JWT Secrets (Generate your own!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Frontend
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Start All Services
```bash
# From root directory
npm run docker:up
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 3000)
- Frontend (port 5173)

### 5. Verify Services

#### Check Backend
```bash
curl http://localhost:3000/health
```

#### Check Frontend
Open browser: http://localhost:5173

### 6. Stop Services
```bash
npm run docker:down
```

---

## Local Development Setup (Without Docker)

### 1. Install PostgreSQL

#### macOS (using Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql-16
sudo systemctl start postgresql
```

#### Windows
Download and install from [PostgreSQL.org](https://www.postgresql.org/download/windows/)

### 2. Create Database
```bash
psql -U postgres
```

In PostgreSQL shell:
```sql
CREATE DATABASE flexstaff_db;
CREATE USER flexstaff_user WITH PASSWORD 'flexstaff_pass';
GRANT ALL PRIVILEGES ON DATABASE flexstaff_db TO flexstaff_user;
\q
```

### 3. Install Redis

#### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt install redis-server
sudo systemctl start redis
```

#### Windows
Download from [Redis.io](https://redis.io/download/) or use WSL

### 4. Set Up Backend
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with local database connection:
```env
DATABASE_URL=postgresql://flexstaff_user:flexstaff_pass@localhost:5432/flexstaff_db
DB_HOST=localhost
REDIS_URL=redis://localhost:6379
```

### 5. Set Up Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```

### 6. Run Database Migrations
```bash
cd backend
npm run migrate
```

### 7. Start Services

In separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Production Setup

### 1. Environment Variables

Set production environment variables:

```env
NODE_ENV=production
DATABASE_URL=<your-production-database-url>
REDIS_URL=<your-production-redis-url>
JWT_SECRET=<strong-secret-key>
STRIPE_SECRET_KEY=<live-stripe-key>
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
```

### 2. Build Backend
```bash
cd backend
npm install --production
npm run build
npm start
```

### 3. Build Frontend
```bash
cd frontend
npm install --production
npm run build
```

Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, etc.)

---

## Stripe Setup

### 1. Create Stripe Account
1. Sign up at https://stripe.com/gb
2. Complete business verification
3. Enable Stripe Connect

### 2. Get API Keys
1. Go to [Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
2. Copy Secret Key and Publishable Key
3. Add to `.env` file

### 3. Configure Webhooks
1. Go to [Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.failed`
   - `transfer.created`
   - `transfer.failed`
4. Copy webhook secret to `.env`

### 4. Test Mode
Use test API keys for development:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

---

## AWS S3 Setup (File Uploads)

### 1. Create S3 Bucket
```bash
aws s3 mb s3://flexstaff-uploads --region eu-west-2
```

### 2. Configure CORS
Create `cors.json`:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:5173", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Apply CORS:
```bash
aws s3api put-bucket-cors --bucket flexstaff-uploads --cors-configuration file://cors.json
```

### 3. Create IAM User
1. Go to AWS IAM Console
2. Create new user with S3 access
3. Attach policy: `AmazonS3FullAccess` (or create custom policy)
4. Save Access Key ID and Secret Access Key

### 4. Add to Environment
```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=eu-west-2
AWS_S3_BUCKET=flexstaff-uploads
```

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Ensure PostgreSQL is running: `brew services list` (macOS)
- Check connection string in `.env`
- Verify database exists: `psql -U postgres -l`

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
- Ensure Redis is running: `brew services list` (macOS)
- Check Redis URL in `.env`
- Test connection: `redis-cli ping`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Docker Issues
```
Error: Cannot connect to Docker daemon
```

**Solution:**
- Ensure Docker Desktop is running
- Restart Docker Desktop
- Check Docker is running: `docker ps`

---

## Next Steps

1. Create your first user account at http://localhost:5173/register
2. Explore the API documentation: [docs/API.md](./API.md)
3. Review the database schema: [backend/src/database/init.sql](../backend/src/database/init.sql)
4. Start building features!

## Support

For issues or questions:
- Check the [README.md](../README.md)
- Review [API.md](./API.md)
- Create an issue on GitHub
