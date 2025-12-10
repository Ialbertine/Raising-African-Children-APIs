# Raising African Children - API Documentation

Complete API documentation for the multilingual blog platform backend.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication API](#authentication-api)
4. [Blog Management API](#blog-management-api)
5. [Contact Management API](#contact-management-api)
6. [Testimonial Management API](#testimonial-management-api)
7. [Data Models](#data-models)
8. [Error Handling](#error-handling)
9. [Environment Variables](#environment-variables)

---

## Overview

**Raising African Children API** is a RESTful backend service built with Node.js, Express, and PostgreSQL. It provides a complete solution for managing a multilingual blog platform with contact forms and testimonials.

### Key Features

- ✅ **Single Admin User** - One admin manages the entire platform
- ✅ **Multilingual Blogs** - Manual translation workflow supporting 6 languages
- ✅ **Contact Management** - Public contact form with admin notifications
- ✅ **Testimonial System** - Public submissions with admin approval workflow
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Reset** - Email-based password recovery
- ✅ **Input Validation** - Comprehensive validation using express-validator
- ✅ **Email Notifications** - SendGrid integration for automated emails

### Base URL
```
http://localhost:5000/api
```

### Supported Languages
- `en` - English
- `fr` - French
- `es` - Spanish
- `de` - German
- `rw` - Kinyarwanda
- `sw` - Swahili

---

## Quick Start

### 1. Environment Setup

Create a `.env` file with:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=raising_african_children
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your-very-secure-secret-key-change-in-production
JWT_EXPIRE=90d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Raising African Children
ADMIN_EMAIL=admin@yourdomain.com
```

### 2. Database Migration

Add password reset fields to Admin table:

```sql
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
```

### 3. Create Admin User

Use the existing script or create manually:

```bash
node src/config/createAdmin.js
```

### 4. Start Server

```bash
npm start
# or
npm run dev
```

---

### Request Flow

```
Client Request 
  → Route (defines endpoint)
  → Middleware (Auth/Validation)
  → Controller (handles request/response)
  → Service (business logic)
  → Model (database operations)
  → Response
```

### Design Principles

1. **Separation of Concerns** - Clear layer separation
2. **Manual Translation Workflow** - Admin creates translations manually
3. **Single Admin System** - One admin manages everything
4. **Security First** - JWT auth, password hashing, input validation
5. **RESTful Design** - Standard HTTP methods and status codes

---

## Authentication API

### Base Endpoint
```
/api/auth
```

### Endpoints

#### 1. Login

**POST** `/api/auth/login`

**Access**: Public

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": "uuid",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

**Notes**:
- Token expires in 7 days (configurable)
- Updates `lastLogin` timestamp
- Store token securely for authenticated requests

---

#### 2. Get Current Profile

**GET** `/api/auth/me`

**Access**: Private (Admin only)

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### 3. Update Profile

**PUT** `/api/auth/profile`

**Access**: Private (Admin only)

**Request Body**:
```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Last Name"
}
```

**Note**: Cannot update email or password through this endpoint.

---

#### 4. Change Password

**PUT** `/api/auth/change-password`

**Access**: Private (Admin only)

**Request Body**:
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password-123"
}
```

**Validation**: New password must be at least 8 characters.

---

#### 5. Request Password Reset

**POST** `/api/auth/forgot-password`

**Access**: Public

**Request Body**:
```json
{
  "email": "admin@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "If that email exists, a password reset link has been sent."
}
```

**Process**:
1. Generates secure reset token
2. Stores hashed token (expires in 1 hour)
3. Sends email with reset link
4. Reset URL: `${FRONTEND_URL}/reset-password?token=<token>&email=<email>`

---

#### 6. Reset Password

**POST** `/api/auth/reset-password`

**Access**: Public

**Request Body**:
```json
{
  "email": "admin@example.com",
  "token": "reset-token-from-email",
  "newPassword": "new-password-123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

---

#### 7. Verify Reset Token

**GET** `/api/auth/verify-reset-token?email=<email>&token=<token>`

**Access**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "valid": true
}
```

---

## Blog Management API

### Base Endpoint
```
/api/blogs
```

### Endpoints

#### 1. Create Blog

**POST** `/api/blogs`

**Access**: Private (Admin only)

**Request Body**:
```json
{
  "slug": "my-blog-post",              // Optional: auto-generated if not provided
  "status": "draft",                    // "draft" | "published" | "archived"
  "category": "Parenting",              // Optional
  "tags": ["children", "education"],    // Optional: array of strings
  "featuredImage": "/uploads/image.jpg", // Optional
  "translations": [
    {
      "languageCode": "en",             // Required: "en" | "fr" | "es" | "de" | "rw" | "sw"
      "title": "Raising African Children", // Required: max 255 chars
      "content": "Full blog content...",    // Required
      "excerpt": "Short excerpt...",       // Optional
      "metaDescription": "SEO description", // Optional: max 160 chars
      "metaKeywords": "keyword1, keyword2"  // Optional: max 255 chars
    },
    {
      "languageCode": "fr",
      "title": "Élever des enfants africains",
      "content": "Contenu français...",
      "excerpt": "Court extrait...",
      "metaDescription": "Description SEO",
      "metaKeywords": "mot-clé1, mot-clé2"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": {
    "id": "uuid",
    "slug": "my-blog-post",
    "status": "draft",
    "category": "Parenting",
    "tags": ["children", "education"],
    "viewCount": 0,
    "translations": [
      {
        "id": "translation-uuid",
        "languageCode": "en",
        "title": "Raising African Children",
        "content": "Full blog content...",
        "excerpt": "Short excerpt...",
        "readingTime": 5,
        "metaDescription": "SEO description",
        "metaKeywords": "keyword1, keyword2"
      }
    ],
    "author": {
      "id": "admin-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "admin@example.com"
    }
  }
}
```

**Key Features**:
- Slug auto-generated from first translation title if not provided
- Reading time auto-calculated (200 words/minute)
- At least one translation required
- One translation per language per blog (unique constraint)
- Author ID automatically set from authenticated admin

---

#### 2. Get All Blogs

**GET** `/api/blogs`

**Access**: Public (unpublished only visible to admins)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 10, max: 100) |
| `status` | string | Filter: "draft", "published", "archived" |
| `languageCode` | string | Filter by language |
| `category` | string | Filter by category |
| `search` | string | Search in title, content, excerpt |
| `includeUnpublished` | boolean | Include unpublished (admin only) |

**Example**:
```
GET /api/blogs?page=1&limit=10&status=published&languageCode=en&category=Parenting&search=children
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "my-blog-post",
      "status": "published",
      "category": "Parenting",
      "tags": ["children", "education"],
      "viewCount": 150,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "translations": [
        {
          "languageCode": "en",
          "title": "Raising African Children",
          "excerpt": "Short excerpt...",
          "readingTime": 5
        }
      ],
      "author": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

#### 3. Get Blog by ID

**GET** `/api/blogs/:id`

**Access**: Public

**Query Parameters**:
- `languageCode` (optional) - Filter translations by language

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "my-blog-post",
    "status": "published",
    "translations": [
      // All translations or filtered by languageCode
    ],
    "author": {
      "id": "admin-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "admin@example.com"
    }
  }
}
```

---

#### 4. Get Blog by Slug

**GET** `/api/blogs/slug/:slug`

**Access**: Public

**Note**: Automatically increments view count.

**Example**:
```
GET /api/blogs/slug/my-blog-post?languageCode=en
```

---

#### 5. Update Blog

**PUT** `/api/blogs/:id`

**Access**: Private (Admin only)

**Request Body**:
```json
{
  "slug": "updated-slug",        // Optional
  "status": "published",          // Optional
  "category": "Updated Category", // Optional
  "tags": ["new", "tags"],       // Optional
  "featuredImage": "/uploads/new.jpg", // Optional
  "translations": [              // Optional: if provided, replaces ALL existing translations
    {
      "languageCode": "en",
      "title": "Updated Title",
      "content": "Updated content...",
      "excerpt": "Updated excerpt",
      "metaDescription": "Updated SEO",
      "metaKeywords": "updated keywords"
    }
  ]
}
```

**Important**: When updating translations, you MUST send ALL translations. The system replaces all existing translations.

---

#### 6. Delete Blog

**DELETE** `/api/blogs/:id`

**Access**: Private (Admin only)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

---

#### 7. Get Categories

**GET** `/api/blogs/categories`

**Access**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "data": ["Parenting", "Education", "Health", "Culture"]
}
```

---

## Contact Management API

### Base Endpoint
```
/api/contacts
```

### Endpoints

#### 1. Create Contact Inquiry

**POST** `/api/contacts`

**Access**: Public

**Request Body**:
```json
{
  "name": "John Doe",                    // Required: 2-100 characters
  "email": "john@example.com",          // Required: valid email
  "phone": "+1234567890",               // Optional
  "subject": "Question about...",      // Optional: max 200 characters
  "message": "Your message here..."     // Required: min 10 characters
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Thank you for contacting us. We will get back to you soon!",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Question about...",
    "message": "Your message here...",
    "isRead": false,
    "readAt": null,
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note**: Automatically sends email notification to admin (if configured).

---

#### 2. Get All Contacts

**GET** `/api/contacts`

**Access**: Private (Admin only)

**Query Parameters**:
- `page` - Page number
- `limit` - Items per page
- `isRead` - Filter by read status (boolean)
- `search` - Search in name, email, subject, message

---

#### 3. Get Contact by ID

**GET** `/api/contacts/:id`

**Access**: Private (Admin only)

---

#### 4. Update Contact

**PUT** `/api/contacts/:id`

**Access**: Private (Admin only)

**Request Body**:
```json
{
  "isRead": true
}
```

**Note**: If marking as read, `readAt` is automatically set.

---

#### 5. Mark as Read/Unread

**PATCH** `/api/contacts/:id/read` - Mark as read  
**PATCH** `/api/contacts/:id/unread` - Mark as unread

**Access**: Private (Admin only)

---

#### 6. Delete Contact

**DELETE** `/api/contacts/:id`

**Access**: Private (Admin only)

---

#### 7. Get Contact Statistics

**GET** `/api/contacts/stats`

**Access**: Private (Admin only)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 150,
    "read": 120,
    "unread": 30
  }
}
```

---

## Testimonial Management API

### Base Endpoint
```
/api/testimonials
```

### Endpoints

#### 1. Create Testimonial

**POST** `/api/testimonials`

**Access**: Public

**Request Body**:
```json
{
  "name": "Jane Smith",              // Required: 2-100 characters
  "email": "jane@example.com",      // Required: valid email
  "message": "Great platform!",    // Required: min 10 characters
  "rating": 5,                      // Optional: 1-5
  "company": "ABC Corp",            // Optional
  "position": "CEO",                // Optional
  "avatar": "/uploads/avatar.jpg"   // Optional
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Thank you for your testimonial! It will be reviewed and published soon.",
  "data": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "message": "Great platform!",
    "rating": 5,
    "isApproved": false,
    "featured": false
  }
}
```

**Note**: Requires admin approval before being visible publicly. Automatically sends email notification to admin.

---

#### 2. Get Approved Testimonials (Public)

**GET** `/api/testimonials/approved`

**Access**: Public

**Query Parameters**:
- `page` - Page number
- `limit` - Items per page
- `featured` - Filter featured testimonials (boolean)

---

#### 3. Get All Testimonials (Admin)

**GET** `/api/testimonials`

**Access**: Private (Admin only)

**Query Parameters**:
- `page` - Page number
- `limit` - Items per page
- `isApproved` - Filter by approval status (boolean)
- `featured` - Filter featured testimonials (boolean)
- `search` - Search in name, email, company, message

---

#### 4. Get Testimonial by ID

**GET** `/api/testimonials/:id`

**Access**: Public (unapproved only visible to admin)

---

#### 5. Update Testimonial

**PUT** `/api/testimonials/:id`

**Access**: Private (Admin only)

**Request Body**:
```json
{
  "isApproved": true,
  "featured": true
}
```

**Note**: If approving, `approvedAt` and `approvedBy` are automatically set.

---

#### 6. Approve Testimonial

**PATCH** `/api/testimonials/:id/approve`

**Access**: Private (Admin only)

**Note**: Sets `approvedAt` and `approvedBy` automatically.

---

#### 7. Reject Testimonial

**PATCH** `/api/testimonials/:id/reject`

**Access**: Private (Admin only)

**Note**: Clears approval fields.

---

#### 8. Toggle Featured Status

**PATCH** `/api/testimonials/:id/featured`

**Access**: Private (Admin only)

---

#### 9. Delete Testimonial

**DELETE** `/api/testimonials/:id`

**Access**: Private (Admin only)

---

#### 10. Get Testimonial Statistics

**GET** `/api/testimonials/stats`

**Access**: Private (Admin only)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 50,
    "approved": 40,
    "pending": 10,
    "featured": 5
  }
}
```

---

## Data Models

### Admin Model

```javascript
{
  id: UUID (primary key),
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  isActive: Boolean (default: true),
  lastLogin: Date (nullable),
  resetPasswordToken: String (nullable, hashed),
  resetPasswordExpires: Date (nullable),
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Model

```javascript
{
  id: UUID (primary key),
  slug: String (unique, required),
  authorId: UUID (references Admin),
  status: ENUM('draft', 'published', 'archived'),
  featuredImage: String (nullable),
  category: String (nullable),
  tags: Array[String],
  viewCount: Integer (default: 0),
  publishedAt: Date (nullable),
  createdAt: Date,
  updatedAt: Date
}
```

### BlogTranslation Model

```javascript
{
  id: UUID (primary key),
  blogId: UUID (references Blog, CASCADE delete),
  languageCode: ENUM('en', 'fr', 'es', 'de', 'rw', 'sw'),
  title: String (max 255, required),
  content: Text (required),
  excerpt: Text (nullable),
  metaDescription: String (max 160, nullable),
  metaKeywords: String (max 255, nullable),
  readingTime: Integer (auto-calculated),
  createdAt: Date,
  updatedAt: Date
}
// Unique constraint: (blogId, languageCode)
```

### Contact Model

```javascript
{
  id: UUID (primary key),
  name: String (required),
  email: String (required),
  phone: String (nullable),
  subject: String (nullable),
  message: Text (required),
  isRead: Boolean (default: false),
  readAt: Date (nullable),
  ipAddress: String (nullable),
  userAgent: Text (nullable),
  createdAt: Date,
  updatedAt: Date
}
```

### Testimonial Model

```javascript
{
  id: UUID (primary key),
  name: String (required),
  email: String (required),
  company: String (nullable),
  position: String (nullable),
  message: Text (required),
  rating: Integer (1-5, nullable),
  avatar: String (nullable),
  isApproved: Boolean (default: false),
  approvedAt: Date (nullable),
  approvedBy: UUID (references Admin, nullable),
  featured: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "msg": "Validation error message",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing/invalid authentication token |
| 403 | Forbidden | Inactive admin account |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

### Common Error Messages

**Authentication**:
- `"Authentication required. Please provide a valid token."` - Missing token
- `"Invalid authentication token."` - Invalid token
- `"Authentication token has expired."` - Expired token
- `"Admin account is inactive."` - Account deactivated

**Validation**:
- `"Validation failed"` - Check `errors` array for details
- `"At least one translation is required"` - Blog creation
- `"A blog with this slug already exists"` - Duplicate slug
- `"Invalid email or password"` - Login failure

**Not Found**:
- `"Blog not found"`
- `"Contact not found"`
- `"Testimonial not found"`
- `"Admin not found"`

---

## Environment Variables

### Required Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=raising_african_children
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Authentication
JWT_SECRET=your-very-secure-secret-key-change-in-production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Raising African Children
ADMIN_EMAIL=admin@yourdomain.com
```

### Optional Variables

- `JWT_EXPIRE` - Token expiration (default: "7d")
- `NODE_ENV` - Environment (development/production)

---

## Frontend Integration Tips

### 1. Authentication

```javascript
// Store token after login
localStorage.setItem('authToken', token);

// Include in requests
headers: {
  'Authorization': `Bearer ${token}`
}

// Handle 401 errors
if (response.status === 401) {
  // Redirect to login
  window.location.href = '/login';
}
```

### 2. Blog Translation Management

**Important**: When updating a blog, send ALL translations. The system replaces all existing translations.

```javascript
// This deletes other translations
PUT /api/blogs/:id
{ translations: [{ languageCode: 'en', ... }] }

// Include all translations
PUT /api/blogs/:id
{ translations: [
    { languageCode: 'en', ... },
    { languageCode: 'fr', ... },
    // All translations
  ]
}
```

### 3. Pagination

All list endpoints support pagination:

```javascript
GET /api/blogs?page=1&limit=10

Response includes:
{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 50,
    pages: 5
  }
}
```

### 4. Error Handling

```javascript
try {
  const response = await fetch('/api/blogs', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  
  if (!result.success) {
    // Handle error
    if (result.errors) {
      // Validation errors
      result.errors.forEach(err => {
        console.error(`${err.param}: ${err.msg}`);
      });
    } else {
      // General error
      alert(result.message);
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Summary

This API provides a complete backend solution for a multilingual blog platform with:

- ✅ **Single Admin System** - One admin manages everything
- ✅ **Multilingual Blogs** - Manual translation workflow (6 languages)
- ✅ **Contact Management** - Public form with admin notifications
- ✅ **Testimonial System** - Public submissions with approval workflow
- ✅ **Secure Authentication** - JWT tokens with password reset
- ✅ **Comprehensive Validation** - Input validation on all endpoints
- ✅ **Email Notifications** - Automated emails via SendGrid

All endpoints are RESTful, well-documented, and ready for frontend integration.

