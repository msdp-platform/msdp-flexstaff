# FlexStaff API Documentation - Complete Reference

## Base URL
```
http://localhost:3000/api (Development)
https://your-domain.com/api (Production)
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Shifts](#shift-endpoints)
3. [Applications](#application-endpoints)
4. [Timesheets](#timesheet-endpoints)
5. [Payments](#payment-endpoints)
6. [Teams](#team-endpoints)
7. [Messages](#message-endpoints)
8. [Ratings](#rating-endpoints)
9. [Notifications](#notification-endpoints)

---

## Authentication Endpoints

### Register
`POST /auth/register`

**Request (Worker):**
```json
{
  "email": "worker@example.com",
  "password": "securepassword",
  "role": "worker",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Request (Employer):**
```json
{
  "email": "employer@example.com",
  "password": "securepassword",
  "role": "employer",
  "companyName": "My Company Ltd",
  "industry": "hospitality"
}
```

### Login
`POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Get Current User
`GET /auth/me`

---

## Shift Endpoints

### List Shifts
`GET /shifts?status=open&industry=hospitality&page=1&limit=20`

**Query Parameters:**
- `status` - draft, open, in_progress, completed, cancelled
- `industry` - hospitality, retail, healthcare, events, logistics, construction, office, other
- `city` - Filter by city
- `dateFrom` - YYYY-MM-DD
- `dateTo` - YYYY-MM-DD
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Get Shift
`GET /shifts/:id`

### Create Shift (Employer)
`POST /shifts`

**Request:**
```json
{
  "title": "Waiter - Evening Shift",
  "description": "Looking for experienced waiter",
  "industry": "hospitality",
  "roleType": "waiter",
  "locationName": "Restaurant ABC",
  "addressLine1": "123 High Street",
  "city": "London",
  "postcode": "SW1A 1AA",
  "shiftDate": "2025-10-10",
  "startTime": "18:00",
  "endTime": "23:00",
  "hourlyRate": 12.50,
  "totalPositions": 2,
  "requirements": "Must have 2+ years experience"
}
```

### Update Shift (Employer)
`PUT /shifts/:id`

### Delete Shift (Employer)
`DELETE /shifts/:id`

### Publish Shift (Employer)
`POST /shifts/:id/publish`

---

## Application Endpoints

### Apply for Shift (Worker)
`POST /applications`

**Request:**
```json
{
  "shiftId": "uuid",
  "coverMessage": "I am interested..."
}
```

### List Applications
`GET /applications?shiftId=uuid`

### Accept Application (Employer)
`POST /applications/:id/accept`

### Reject Application (Employer)
`POST /applications/:id/reject`

---

## Timesheet Endpoints

### Create Timesheet
`POST /timesheets`

**Request:**
```json
{
  "assignmentId": "uuid"
}
```

### List Timesheets
`GET /timesheets?status=pending&page=1&limit=20`

**Query Parameters:**
- `status` - pending, submitted, approved, rejected, disputed

### Get Timesheet
`GET /timesheets/:id`

### Clock In (Worker)
`POST /timesheets/:id/clock-in`

### Clock Out (Worker)
`POST /timesheets/:id/clock-out`

**Request:**
```json
{
  "breakDuration": 30
}
```

### Submit Timesheet (Worker)
`POST /timesheets/:id/submit`

### Approve Timesheet (Employer)
`POST /timesheets/:id/approve`

### Reject Timesheet (Employer)
`POST /timesheets/:id/reject`

**Request:**
```json
{
  "notes": "Hours don't match our records"
}
```

---

## Payment Endpoints

### Create Stripe Account
`POST /payments/stripe/account`

**Request:**
```json
{
  "accountType": "express"
}
```

**Response:**
```json
{
  "accountId": "acct_xxx",
  "onboardingUrl": "https://connect.stripe.com/..."
}
```

### Get Stripe Account Status
`GET /payments/stripe/account/status`

**Response:**
```json
{
  "accountId": "acct_xxx",
  "status": {
    "chargesEnabled": true,
    "payoutsEnabled": true,
    "detailsSubmitted": true
  }
}
```

### Process Payment
`POST /payments/process`

**Request:**
```json
{
  "timesheetId": "uuid"
}
```

### List Payments
`GET /payments?status=completed&page=1&limit=20`

**Query Parameters:**
- `status` - pending, processing, completed, failed, refunded

### Get Payment
`GET /payments/:id`

### Stripe Webhook
`POST /payments/webhook/stripe`

**Note:** This endpoint is called by Stripe. Requires Stripe signature verification.

---

## Team Endpoints

### Add Worker to Team (Employer)
`POST /teams`

**Request:**
```json
{
  "workerId": "uuid",
  "autoAccept": true
}
```

### Remove Worker from Team (Employer)
`DELETE /teams/:id`

### Update Team Member (Employer)
`PUT /teams/:id`

**Request:**
```json
{
  "autoAccept": false
}
```

### Get My Team (Employer)
`GET /teams/my-team`

**Response:**
```json
{
  "team": [
    {
      "id": "uuid",
      "autoAccept": true,
      "worker": { ... }
    }
  ]
}
```

### Get My Teams (Worker)
`GET /teams/my-teams`

**Response:**
```json
{
  "teams": [
    {
      "id": "uuid",
      "autoAccept": true,
      "employer": { ... }
    }
  ]
}
```

### Check Team Membership
`GET /teams/check?employerId=uuid&workerId=uuid`

**Response:**
```json
{
  "isMember": true,
  "autoAccept": true
}
```

---

## Message Endpoints

### Send Message
`POST /messages`

**Request:**
```json
{
  "receiverId": "uuid",
  "messageText": "Hello, I have a question about the shift",
  "shiftId": "uuid"
}
```

### Get Conversations
`GET /messages/conversations`

**Response:**
```json
{
  "conversations": [
    {
      "user": { ... },
      "lastMessage": { ... },
      "unreadCount": 3
    }
  ]
}
```

### Get Messages with User
`GET /messages/:userId?page=1&limit=50`

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "messageText": "Hello",
      "sender": { ... },
      "receiver": { ... },
      "readAt": null,
      "createdAt": "2025-10-05T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Mark Message as Read
`PUT /messages/:id/read`

### Get Unread Count
`GET /messages/unread-count`

**Response:**
```json
{
  "unreadCount": 5
}
```

---

## Rating Endpoints

### Create Rating
`POST /ratings`

**Request:**
```json
{
  "assignmentId": "uuid",
  "rating": 5,
  "reviewText": "Excellent worker, very professional"
}
```

**Note:**
- Employers rate workers
- Workers rate employers
- Rating must be 1-5

### Get User Ratings
`GET /ratings/user/:userId?page=1&limit=20`

**Response:**
```json
{
  "ratings": [ ... ],
  "averageRating": "4.75",
  "totalRatings": 24,
  "pagination": { ... }
}
```

### Get Worker Ratings
`GET /ratings/worker/:workerId`

**Response:**
```json
{
  "ratings": [ ... ],
  "averageRating": "4.80",
  "totalRatings": 30,
  "distribution": {
    "5": 25,
    "4": 4,
    "3": 1,
    "2": 0,
    "1": 0
  }
}
```

### Get Employer Ratings
`GET /ratings/employer/:employerId`

---

## Notification Endpoints

### Get Notifications
`GET /notifications?unreadOnly=true&page=1&limit=50`

**Query Parameters:**
- `unreadOnly` - true/false

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "New Shift Application",
      "message": "John Doe has applied for your shift",
      "type": "shift_application",
      "relatedId": "uuid",
      "readAt": null,
      "createdAt": "2025-10-05T10:00:00Z"
    }
  ],
  "unreadCount": 12,
  "pagination": { ... }
}
```

### Mark Notification as Read
`PUT /notifications/:id/read`

### Mark All as Read
`PUT /notifications/read-all`

### Delete Notification
`DELETE /notifications/:id`

---

## Notification Types

- `shift_application` - Worker applied for shift
- `application_accepted` - Application was accepted
- `application_rejected` - Application was rejected
- `timesheet_submitted` - Timesheet needs approval
- `timesheet_approved` - Timesheet was approved
- `payment_received` - Payment received
- `team_invitation` - Added to employer's team
- `new_message` - New message received
- `shift_reminder` - Upcoming shift reminder

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- Window: 15 minutes
- Max requests: 100 per window
- Header: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Webhooks

### Stripe Webhooks

Configure at: `https://your-domain.com/api/payments/webhook/stripe`

**Events handled:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `transfer.created`
- `transfer.failed`

---

## Data Formats

### Dates
- Format: `YYYY-MM-DD`
- Example: `2025-10-15`

### Times
- Format: `HH:MM` or `HH:MM:SS`
- Example: `14:30` or `14:30:00`

### Timestamps
- Format: ISO 8601
- Example: `2025-10-05T14:30:00Z`

### Currency
- Format: Decimal (pounds)
- Example: `12.50` (£12.50)

### Phone Numbers (UK)
- Format: `+44xxxxxxxxxx`
- Example: `+447700900123`

---

## Postcode Validation (UK)

Valid formats:
- `SW1A 1AA`
- `EC1A 1BB`
- `W1A 0AX`

---

## Testing

### Test Accounts

**Test Employer:**
```
Email: employer@test.com
Password: Test1234!
```

**Test Worker:**
```
Email: worker@test.com
Password: Test1234!
```

### Stripe Test Cards

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Failure:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

---

## Best Practices

1. **Always handle errors** - Check for error responses
2. **Use pagination** - Don't fetch all data at once
3. **Cache responses** - Use ETags when available
4. **Rate limiting** - Respect rate limits
5. **Webhooks** - Use webhooks for real-time updates
6. **HTTPS only** - Never use HTTP in production
7. **Token refresh** - Implement token refresh logic

---

## Support

For API issues or questions:
- GitHub Issues: [Link to repo]
- Email: support@flexstaff.co.uk
- Documentation: [Link to docs]
