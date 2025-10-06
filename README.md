# FlexStaff - UK Flexible Staffing Marketplace

A comprehensive flexible staffing marketplace platform for the UK market, supporting multi-industry workforce management. Built with modern technologies and inspired by Limber.work.

## 🌟 Features

### For Employers
- Post and manage shifts across multiple industries
- Review applicants with ratings, experience, and compliance badges
- In-app messaging with workers
- Timesheet confirmation
- Build and manage private worker teams with auto-accept
- Multi-location support
- Real-time notifications
- Analytics dashboard

### For Workers
- Browse and apply for shifts
- Video profile creation
- Skill and certification management
- Shift history and earnings tracking
- Rating system
- Weekly automatic payouts
- Early wage access (50% after timesheet approval)
- Team invitations from preferred employers

### Platform Features
- Automated payroll processing (PAYE, pension, insurance)
- Right-to-work verification
- Payment processing via Stripe Connect
- Compliance tracking (DBS, certifications)
- Bidirectional rating system
- Dispute resolution
- Analytics and reporting

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Sequelize with TypeScript
- **Cache:** Redis
- **Authentication:** JWT
- **Payment:** Stripe Connect (UK)
- **File Storage:** AWS S3
- **Background Jobs:** Bull Queue

### Frontend (Web)
- **Framework:** React 18 with TypeScript

### Mobile Apps
- **Framework:** React Native with Expo
- **Platforms:** iOS & Android
- **UI:** React Native Paper (Material Design 3)
- **Navigation:** React Navigation 6
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **API Client:** Axios + React Query
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Cloud:** AWS (recommended)
- **CI/CD:** GitHub Actions (to be configured)

## 📋 Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Docker & Docker Compose (for local development)
- PostgreSQL 16 (if running locally without Docker)
- Redis (if running locally without Docker)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd arteze-professional-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start with Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
npm run docker:up

# Stop all services
npm run docker:down
```

### 5. Start without Docker

#### Start Backend
```bash
cd backend
npm install
npm run dev
```

#### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 Project Structure

```
arteze-professional-service/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   ├── database/       # Database migrations/seeds
│   │   └── index.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── mobile/                # React Native app (to be implemented)
├── shared/                # Shared types/utilities
├── docs/                  # Documentation
├── docker-compose.yml     # Docker configuration
└── package.json           # Root package.json
```

## 🗄️ Database Schema

The database includes the following main entities:

- **Users** - Base user authentication
- **Employers** - Business profiles
- **Workers** - Worker profiles with skills/certifications
- **Shifts** - Posted shifts with requirements
- **Applications** - Worker applications to shifts
- **ShiftAssignments** - Confirmed assignments
- **Timesheets** - Hours worked tracking
- **Payments** - Payment processing
- **Teams** - Employer's preferred workers
- **Messages** - In-app messaging
- **Notifications** - User notifications
- **Ratings** - Bidirectional reviews

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Shifts
- `GET /api/shifts` - List shifts (with filters)
- `GET /api/shifts/:id` - Get shift details
- `POST /api/shifts` - Create shift (employer)
- `PUT /api/shifts/:id` - Update shift (employer)
- `DELETE /api/shifts/:id` - Delete shift (employer)
- `POST /api/shifts/:id/publish` - Publish shift (employer)

### Applications
- `POST /api/applications` - Apply for shift (worker)
- `GET /api/applications` - List applications
- `POST /api/applications/:id/accept` - Accept application (employer)
- `POST /api/applications/:id/reject` - Reject application (employer)

### Additional endpoints for timesheets, payments, teams, and messages are defined in the codebase.

## 💳 Payment Integration (Stripe Connect - UK)

This platform uses Stripe Connect for marketplace payments:

1. **Employers** connect their Stripe account to receive payments
2. **Workers** connect their bank account to receive payouts
3. **Platform** handles:
   - Payment collection from employers
   - Platform fee calculation (10% default)
   - Automated payouts to workers
   - Tax compliance (PAYE, NI)
   - Pension contributions

### Setup Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the dashboard
3. Enable Stripe Connect
4. Add keys to `.env` file
5. Configure webhook endpoints

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment (AWS recommended)

1. Set up AWS infrastructure (EC2, RDS, ElastiCache)
2. Configure environment variables
3. Build and deploy:

```bash
cd backend
npm run build
npm start
```

### Frontend Deployment (Vercel/Netlify recommended)

```bash
cd frontend
npm run build
# Deploy dist/ folder
```

## 📱 Mobile App (Coming Soon)

React Native mobile app for iOS and Android is planned for Phase 2.

## 🔧 Environment Variables

### Backend Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `TWILIO_AUTH_TOKEN` - Twilio for SMS

See `.env.example` for complete list.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🗺️ Roadmap

### Phase 1: MVP (Completed)
- ✅ User authentication
- ✅ Basic shift management
- ✅ Application system
- ✅ Core API endpoints

### Phase 2: Core Features (In Progress)
- ⏳ Payment integration
- ⏳ Rating system
- ⏳ Team management
- ⏳ Mobile apps

### Phase 3: Advanced Features
- ⏳ Compliance verification
- ⏳ Advanced analytics
- ⏳ White-label solution
- ⏳ ML-powered recommendations

## 🏆 Key Differentiators

1. **UK-Specific Compliance** - Built for UK employment law, PAYE, pensions
2. **Multi-Industry Support** - Hospitality, retail, healthcare, and more
3. **Team Building** - Employers can build trusted worker pools
4. **Auto-Accept** - Streamlined booking for trusted relationships
5. **Early Wage Access** - Workers can access earnings early

---

Built with ❤️ for the UK flexible staffing market
