# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "worker",
  "firstName": "John",
  "lastName": "Doe"
}
```

For employers:
```json
{
  "email": "employer@example.com",
  "password": "securepassword",
  "role": "employer",
  "companyName": "My Company Ltd",
  "industry": "hospitality"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": { ... },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Get Current User
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "worker",
    "employer": null,
    "worker": { ... }
  }
}
```

---

## Shift Endpoints

### List Shifts
```http
GET /shifts?status=open&industry=hospitality&page=1&limit=20
```

**Query Parameters:**
- `status` - Filter by status (draft, open, in_progress, completed, cancelled)
- `industry` - Filter by industry
- `city` - Filter by city
- `dateFrom` - Filter shifts from date (YYYY-MM-DD)
- `dateTo` - Filter shifts to date (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "shifts": [
    {
      "id": "uuid",
      "title": "Waiter - Evening Shift",
      "description": "Looking for experienced waiter",
      "industry": "hospitality",
      "roleType": "waiter",
      "shiftDate": "2025-10-10",
      "startTime": "18:00:00",
      "endTime": "23:00:00",
      "hourlyRate": 12.50,
      "totalPositions": 2,
      "filledPositions": 0,
      "status": "open",
      "employer": { ... }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Get Shift
```http
GET /shifts/:id
```

**Response:**
```json
{
  "shift": {
    "id": "uuid",
    "title": "Waiter - Evening Shift",
    "employer": { ... },
    "applications": [ ... ]
  }
}
```

### Create Shift (Employer Only)
```http
POST /shifts
```

**Request Body:**
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

### Update Shift (Employer Only)
```http
PUT /shifts/:id
```

### Delete Shift (Employer Only)
```http
DELETE /shifts/:id
```

### Publish Shift (Employer Only)
```http
POST /shifts/:id/publish
```

---

## Application Endpoints

### Apply for Shift (Worker Only)
```http
POST /applications
```

**Request Body:**
```json
{
  "shiftId": "uuid",
  "coverMessage": "I am interested in this position because..."
}
```

### List Applications
```http
GET /applications?shiftId=uuid
```

### Accept Application (Employer Only)
```http
POST /applications/:id/accept
```

### Reject Application (Employer Only)
```http
POST /applications/:id/reject
```

---

## Industry Types

```
- hospitality
- retail
- healthcare
- events
- logistics
- construction
- office
- other
```

## User Roles

```
- worker
- employer
- admin
```

## Shift Status

```
- draft
- open
- in_progress
- completed
- cancelled
```

## Application Status

```
- pending
- accepted
- rejected
- withdrawn
```

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
- Applies to all endpoints

## Pagination

All list endpoints support pagination:
- Default page size: 20
- Max page size: 100
- Page numbering starts at 1

## Date/Time Formats

- Dates: `YYYY-MM-DD`
- Times: `HH:MM:SS` or `HH:MM`
- Timestamps: ISO 8601 format
