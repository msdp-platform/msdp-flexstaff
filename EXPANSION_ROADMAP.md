# FlexStaff Platform Expansion Roadmap
## From Shift Workers to Skilled Freelancers

### Project Overview
Expanding FlexStaff from a hospitality-focused shift marketplace to a comprehensive platform supporting skilled freelancers (plumbers, electricians, cleaners, carpenters, etc.) while maintaining the successful shift-based model.

---

## ✅ Phase 1: Foundation (COMPLETED)

### 1.1 Database Expansion
- ✅ Added new industry types to PostgreSQL enum:
  - **Skilled Trades**: Plumbing, Electrical, Carpentry, Painting, HVAC, Construction
  - **Home Services**: Cleaning, Gardening/Landscaping
  - **Security Services**: Security
  - **Existing**: Hospitality, Retail, Healthcare, Events, Office, Logistics

### 1.2 UI Updates
- ✅ Updated CreateShift form with categorized industry dropdown:
  - Service Industries
  - Skilled Trades
  - Home Services
  - Other
- ✅ Created shift posting functionality
- ✅ Added dashboard quick actions

### 1.3 User Accounts
- ✅ Created test accounts:
  - Worker: `worker@test.com` / `password123`
  - Employer: `employer@test.com` / `password123`
  - Admin: `admin@test.com` / `admin123`

---

## 🔄 Phase 2: Core Features (IN PROGRESS)

### 2.1 Terminology Update
- [ ] Rename "Shift" → "Job" or "Booking" throughout:
  - Database tables/columns
  - API endpoints
  - Frontend components
  - User-facing text

### 2.2 Job Duration Types
- [ ] Add job type field:
  - Quick Job (1-4 hours) - e.g., Fix leaking tap
  - Day Job (4-8 hours) - e.g., Kitchen installation
  - Multi-day Project (multiple days) - e.g., Home renovation
- [ ] Update pricing to support both hourly and project-based rates

### 2.3 Enhanced Worker Profiles
- [ ] Add certifications/licenses section:
  - Upload capability for certificates
  - Expiry date tracking
  - Verification badges
- [ ] Portfolio/photos feature:
  - Upload previous work photos
  - Categorize by job type
  - Display in worker profile
- [ ] Skill badges system:
  - Industry-specific skills
  - Verified credentials
  - Training certificates

---

## 📋 Phase 3: Limber-Inspired Features (PLANNED)

### 3.1 Team Building (Top Priority)
Implement Limber's "Build Your Team" feature:
- [ ] Favorite/trusted worker lists
- [ ] Auto-accept for team members
- [ ] Multi-site team sharing
- [ ] Priority job notifications for team members

### 3.2 Advanced Screening
- [ ] Skill demonstration videos
- [ ] Detailed rating system per skill
- [ ] Reliability metrics
- [ ] Previous job history

### 3.3 Automation
- [ ] Automated right-to-work checks
- [ ] Centralized payroll
- [ ] Insurance processing
- [ ] PAYE and pension handling

---

## 🎨 Phase 4: UI/UX Enhancement (PLANNED)

### 4.1 Limber-Style Design
- [ ] Hero section with value proposition
- [ ] Blue & white color scheme
- [ ] Testimonial carousel
- [ ] Client logos/social proof
- [ ] Mobile-first responsive design

### 4.2 Landing Pages
- [ ] Separate flows for:
  - Employers/Hirers
  - Workers/Freelancers
- [ ] Industry-specific landing pages
- [ ] "How It Works" pages

### 4.3 Mobile App
- [ ] React Native app (already structured in `/mobile`)
- [ ] Push notifications for new jobs
- [ ] Quick apply functionality
- [ ] In-app messaging

---

## 🔧 Phase 5: Platform Enhancements (FUTURE)

### 5.1 Advanced Features
- [ ] In-app messaging system
- [ ] GPS check-in/check-out
- [ ] Photo upload for completed work
- [ ] Dispute resolution system
- [ ] Multi-language support

### 5.2 Business Features
- [ ] White-label solution
- [ ] Multi-site management
- [ ] Advanced analytics dashboard
- [ ] Custom integrations (scheduling tools)

### 5.3 Payment Enhancements
- [ ] Early wage access (50% after completion)
- [ ] Weekly automated payouts
- [ ] Multiple payment methods
- [ ] Invoice generation

---

## 📊 Industry-Specific Role Examples

### Hospitality
- Waiter, Bartender, Chef, Kitchen Porter, Host/Hostess

### Skilled Trades
**Plumbing**: Plumber, Gas Engineer, Pipefitter
**Electrical**: Electrician, Electrical Engineer, Lighting Technician
**Carpentry**: Carpenter, Cabinet Maker, Furniture Maker
**Painting**: Painter, Decorator, Wallpaper Specialist
**HVAC**: HVAC Technician, Heating Engineer, AC Specialist

### Home Services
**Cleaning**: Domestic Cleaner, Commercial Cleaner, Deep Cleaner
**Gardening**: Gardener, Landscaper, Tree Surgeon

### Security
- Security Guard, Door Supervisor, CCTV Operator

---

## 🚀 Next Immediate Steps

1. **Update terminology** from "Shift" to "Job"
2. **Add job duration types** to database and UI
3. **Implement team building** feature (favorite workers)
4. **Create worker portfolio** upload functionality
5. **Add certifications** management system

---

## 💡 Key Differentiators (vs. Limber)

1. **Multi-Industry Support** - Beyond hospitality
2. **Skilled Trades Focus** - Plumbers, electricians, etc.
3. **Flexible Job Types** - Quick jobs to multi-day projects
4. **Portfolio System** - Visual work history
5. **Certification Tracking** - Compliance for licensed trades

---

## 📈 Success Metrics

- Number of active workers per industry
- Job completion rate
- Average hourly rate by trade
- Employer satisfaction score
- Worker retention rate
- Time to fill jobs

---

*Last Updated: October 6, 2025*
