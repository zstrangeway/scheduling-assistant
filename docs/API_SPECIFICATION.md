# API Specification

This document outlines the REST API endpoints for the Availability Helper application.

## Base URL
```
Development: http://localhost:8000/api
Production: https://api.availability-helper.com/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": false
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login
Authenticate user and return JWT token.

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
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/logout
Logout user (client should discard token).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### GET /auth/me
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": true
    }
  }
}
```

## Group Endpoints

### POST /groups
Create a new group.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Family Group",
  "description": "Our family scheduling group"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": "clxxx...",
      "name": "Family Group",
      "description": "Our family scheduling group",
      "ownerId": "clxxx...",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### GET /groups
Get all groups where user is a member.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "clxxx...",
        "name": "Family Group",
        "description": "Our family scheduling group",
        "role": "OWNER",
        "memberCount": 5,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### GET /groups/:id
Get detailed information about a specific group.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": "clxxx...",
      "name": "Family Group",
      "description": "Our family scheduling group",
      "ownerId": "clxxx...",
      "createdAt": "2024-01-15T10:00:00Z",
      "members": [
        {
          "id": "clxxx...",
          "user": {
            "id": "clxxx...",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "role": "OWNER",
          "joinedAt": "2024-01-15T10:00:00Z"
        }
      ]
    }
  }
}
```

### PUT /groups/:id
Update group information (owner/admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Family Group",
  "description": "Updated description"
}
```

### DELETE /groups/:id
Delete group (owner only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Group deleted successfully"
  }
}
```

## Group Member Endpoints

### POST /groups/:id/members/:userId/role
Update member role (owner/admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

### DELETE /groups/:id/members/:userId
Remove member from group (owner/admin only, or self).

**Headers:** `Authorization: Bearer <token>`

## Invitation Endpoints

### POST /groups/:id/invites
Send invitation to join group.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newmember@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invite": {
      "id": "clxxx...",
      "email": "newmember@example.com",
      "status": "PENDING",
      "expiresAt": "2024-01-22T10:00:00Z"
    }
  }
}
```

### GET /groups/:id/invites
Get all invitations for a group (owner/admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "invites": [
      {
        "id": "clxxx...",
        "email": "newmember@example.com",
        "status": "PENDING",
        "inviter": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-15T10:00:00Z",
        "expiresAt": "2024-01-22T10:00:00Z"
      }
    ]
  }
}
```

### GET /invites/:token
Get invitation details by token (public endpoint).

**Response:**
```json
{
  "success": true,
  "data": {
    "invite": {
      "id": "clxxx...",
      "group": {
        "name": "Family Group",
        "description": "Our family scheduling group"
      },
      "inviter": {
        "name": "John Doe"
      },
      "email": "newmember@example.com",
      "expiresAt": "2024-01-22T10:00:00Z"
    }
  }
}
```

### POST /invites/:token/accept
Accept invitation (requires authentication if user exists).

**Headers:** `Authorization: Bearer <token>` (if logged in)

**Response:**
```json
{
  "success": true,
  "data": {
    "membership": {
      "groupId": "clxxx...",
      "role": "MEMBER",
      "joinedAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### POST /invites/:token/decline
Decline invitation.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Invitation declined"
  }
}
```

## Event Endpoints

### POST /groups/:id/events
Create event in group.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Family Dinner",
  "description": "Monthly family gathering",
  "eventDate": "2024-01-15",
  "startTime": "18:00:00",
  "endTime": "20:00:00",
  "location": "Mom's house"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "clxxx...",
      "title": "Family Dinner",
      "description": "Monthly family gathering",
      "eventDate": "2024-01-15",
      "startTime": "18:00:00",
      "endTime": "20:00:00",
      "location": "Mom's house",
      "createdBy": "clxxx...",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  }
}
```

### GET /groups/:id/events
Get events for a group.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `from` (optional): Start date filter (YYYY-MM-DD)
- `to` (optional): End date filter (YYYY-MM-DD)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "clxxx...",
        "title": "Family Dinner",
        "eventDate": "2024-01-15",
        "startTime": "18:00:00",
        "endTime": "20:00:00",
        "location": "Mom's house",
        "responseCount": {
          "available": 3,
          "unavailable": 1,
          "maybe": 1,
          "noResponse": 2
        }
      }
    ]
  }
}
```

### GET /events/:id
Get detailed event information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "clxxx...",
      "title": "Family Dinner",
      "description": "Monthly family gathering",
      "eventDate": "2024-01-15",
      "startTime": "18:00:00",
      "endTime": "20:00:00",
      "location": "Mom's house",
      "creator": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "responses": [
        {
          "user": {
            "name": "Jane Doe",
            "email": "jane@example.com"
          },
          "status": "AVAILABLE",
          "notes": "Looking forward to it!",
          "respondedAt": "2024-01-12T10:00:00Z"
        }
      ]
    }
  }
}
```

### PUT /events/:id
Update event (creator/group admin/owner only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Family Dinner",
  "description": "Updated description",
  "eventDate": "2024-01-16",
  "startTime": "19:00:00",
  "endTime": "21:00:00",
  "location": "Dad's house"
}
```

### DELETE /events/:id
Delete event (creator/group admin/owner only).

**Headers:** `Authorization: Bearer <token>`

## Availability Response Endpoints

### POST /events/:id/responses
Respond to event availability.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "AVAILABLE",
  "notes": "Looking forward to it!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": {
      "status": "AVAILABLE",
      "notes": "Looking forward to it!",
      "respondedAt": "2024-01-12T10:00:00Z"
    }
  }
}
```

### PUT /events/:id/responses
Update availability response.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "MAYBE",
  "notes": "Might be running late"
}
```

### DELETE /events/:id/responses
Remove availability response.

**Headers:** `Authorization: Bearer <token>`

## Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `EXPIRED`: Token or invitation expired
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- Authentication endpoints: 10 requests per minute per IP
- API endpoints: 100 requests per minute per user
- Email invitations: 20 per hour per user