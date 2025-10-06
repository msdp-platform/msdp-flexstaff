# Deployment Guide

This guide covers deploying the FlexStaff marketplace to production.

## Pre-Deployment Checklist

### Security
- [ ] Change all JWT secrets to strong random values
- [ ] Update database passwords
- [ ] Configure CORS for production domain only
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up rate limiting
- [ ] Configure helmet.js security headers
- [ ] Enable SQL injection protection
- [ ] Set up DDoS protection (Cloudflare)

### Environment Variables
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Set up production Redis instance
- [ ] Add Stripe live API keys
- [ ] Configure AWS S3 credentials
- [ ] Set up Twilio for SMS
- [ ] Configure SendGrid for emails

### Database
- [ ] Run database migrations
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Enable SSL for database connections
- [ ] Set up read replicas (optional)

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging (Winston + CloudWatch)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up alerting

---

## AWS Deployment (Recommended)

### Architecture Overview

```
┌─────────────────────┐
│   CloudFront CDN    │ (Frontend)
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│      S3 Bucket      │ (Static Files)
└─────────────────────┘

┌─────────────────────┐
│   Route 53 (DNS)    │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Application LB     │
└──────────┬──────────┘
           │
     ┌─────▼─────┐
     │   EC2     │ (Backend API)
     │  Auto     │
     │  Scaling  │
     └─────┬─────┘
           │
     ┌─────▼─────────────────┐
     │   RDS PostgreSQL      │
     │   (Multi-AZ)          │
     └───────────────────────┘

     ┌───────────────────────┐
     │  ElastiCache Redis    │
     └───────────────────────┘
```

### Step 1: Set Up Database (RDS)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier flexstaff-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username flexstaff \
  --master-user-password YOUR_STRONG_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name your-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

### Step 2: Set Up Redis (ElastiCache)

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id flexstaff-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-subnet-group-name your-subnet-group \
  --security-group-ids sg-xxxxx
```

### Step 3: Deploy Backend (EC2 with PM2)

#### Create EC2 Instance

```bash
# Launch EC2 instance (Ubuntu 22.04)
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.small \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx \
  --user-data file://user-data.sh
```

#### user-data.sh

```bash
#!/bin/bash
# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Create app directory
mkdir -p /var/www/flexstaff
cd /var/www/flexstaff

# Clone repository (use CI/CD instead in production)
# git clone your-repo-url .

# Install dependencies
npm install --production

# Set up environment variables
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/flexstaff_db
REDIS_URL=redis://redis-endpoint:6379
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_live_your_key
EOF

# Build application
npm run build

# Start with PM2
pm2 start dist/index.js --name flexstaff-api
pm2 save
pm2 startup
```

#### PM2 Ecosystem File (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'flexstaff-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Step 4: Deploy Frontend (S3 + CloudFront)

```bash
# Build frontend
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://flexstaff-frontend

# Configure bucket for static website hosting
aws s3 website s3://flexstaff-frontend \
  --index-document index.html \
  --error-document index.html

# Upload build files
aws s3 sync dist/ s3://flexstaff-frontend --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name flexstaff-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

### Step 5: Set Up Load Balancer

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name flexstaff-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Create target group
aws elbv2 create-target-group \
  --name flexstaff-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --health-check-path /health

# Register EC2 instances
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --targets Id=i-xxxxx
```

### Step 6: Configure SSL (ACM)

```bash
# Request SSL certificate
aws acm request-certificate \
  --domain-name flexstaff.co.uk \
  --subject-alternative-names www.flexstaff.co.uk api.flexstaff.co.uk \
  --validation-method DNS

# Add HTTPS listener to ALB
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

## Alternative: Docker + Kubernetes

### Dockerfile (Production)

**Backend:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Frontend:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Kubernetes Deployment

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flexstaff-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: flexstaff-backend
  template:
    metadata:
      labels:
        app: flexstaff-backend
    spec:
      containers:
      - name: backend
        image: your-registry/flexstaff-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: flexstaff-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: flexstaff-backend-service
spec:
  selector:
    app: flexstaff-backend
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## CI/CD with GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/flexstaff/backend
            git pull
            npm install --production
            npm run build
            pm2 reload flexstaff-api

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --delete
        env:
          AWS_S3_BUCKET: flexstaff-frontend
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          SOURCE_DIR: frontend/dist
```

---

## Monitoring & Logging

### Sentry (Error Tracking)

```typescript
// backend/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### CloudWatch Logs

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb

# Configure CloudWatch
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json << EOF
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/www/flexstaff/logs/*.log",
            "log_group_name": "/aws/ec2/flexstaff",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
EOF
```

---

## Backup Strategy

### Database Backups

```bash
# Automated daily backups (RDS)
aws rds modify-db-instance \
  --db-instance-identifier flexstaff-prod \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"

# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier flexstaff-prod \
  --db-snapshot-identifier flexstaff-$(date +%Y%m%d)
```

### Application Backups

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup application files
tar -czf $BACKUP_DIR/flexstaff-app-$DATE.tar.gz /var/www/flexstaff

# Upload to S3
aws s3 cp $BACKUP_DIR/flexstaff-app-$DATE.tar.gz \
  s3://flexstaff-backups/app/

# Delete local backup
rm $BACKUP_DIR/flexstaff-app-$DATE.tar.gz
```

---

## Performance Optimization

### Enable Gzip Compression
```nginx
# nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Enable Caching
```typescript
// Redis caching
import redis from 'redis';
const cache = redis.createClient({
  url: process.env.REDIS_URL
});

// Cache middleware
const cacheMiddleware = async (req, res, next) => {
  const key = req.originalUrl;
  const cached = await cache.get(key);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    cache.setex(key, 300, JSON.stringify(body));
    res.sendResponse(body);
  };

  next();
};
```

---

## Rollback Procedure

```bash
# Rollback backend deployment
pm2 stop flexstaff-api
git checkout previous-commit-hash
npm install
npm run build
pm2 start flexstaff-api

# Rollback frontend deployment
aws s3 sync s3://flexstaff-frontend-backup/previous-version/ \
  s3://flexstaff-frontend/ --delete

# Rollback database migration
npm run migrate:rollback
```

---

## Post-Deployment

1. **Test all critical paths:**
   - User registration
   - Shift creation
   - Payment processing
   - Notifications

2. **Monitor logs:**
   ```bash
   pm2 logs flexstaff-api
   ```

3. **Check health endpoint:**
   ```bash
   curl https://api.flexstaff.co.uk/health
   ```

4. **Verify Stripe webhooks:**
   - Check webhook delivery in Stripe dashboard

5. **Test email delivery:**
   - Send test notification emails

---

## Scaling

### Horizontal Scaling (EC2 Auto Scaling)

```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name flexstaff-template \
  --version-description "v1" \
  --launch-template-data file://template-data.json

# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name flexstaff-asg \
  --launch-template LaunchTemplateName=flexstaff-template \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --target-group-arns arn:aws:elasticloadbalancing:...
```

### Database Read Replicas

```bash
# Create read replica
aws rds create-db-instance-read-replica \
  --db-instance-identifier flexstaff-read-replica \
  --source-db-instance-identifier flexstaff-prod
```

---

## Support

For deployment issues:
- Check logs: `pm2 logs`
- Monitor errors: Sentry dashboard
- Database status: RDS console
- Contact: devops@flexstaff.co.uk
