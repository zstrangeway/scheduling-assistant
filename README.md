# Availability Helper

A web application for group scheduling and availability coordination.

## Overview

Availability Helper solves the common problem of coordinating schedules among family members, friends, and groups. Users can create groups, invite others via email, and manage shared scheduling.

## Features

### Core Functionality
- **User Management**: Sign up, login, and profile management
- **Group Creation**: Create and manage groups with multiple members
- **Email Invitations**: Invite users to groups via email with seamless signup flow
- **Scheduling**: Create and coordinate events within groups
- **Availability Tracking**: Members can indicate their availability for group events

### User Flow
1. **Registration**: New users sign up with email and password
2. **Group Management**: Users create groups and become group owners
3. **Invitations**: Group owners invite members via email address
4. **Invitation Acceptance**: 
   - Existing users receive notification and can accept/decline
   - New users get signup link, then can accept invitation
5. **Scheduling**: Group members create and respond to scheduling requests

## Technical Architecture

### Tech Stack
- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js (Google/GitHub OAuth)
- **Email Service**: Resend
- **Hosting**: Vercel (full-stack)

### Database Schema
- **Users**: User accounts and authentication
- **Groups**: Group information and ownership
- **GroupMembers**: Group membership and roles
- **Invites**: Email invitations and status tracking
- **Events**: Scheduling events and details
- **Availability**: Member availability responses

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Google OAuth app (for authentication)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd availability-helper

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables
```
DATABASE_URL=postgresql://username:password@localhost:5432/availability_helper
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
RESEND_API_KEY=your-resend-api-key
```

## Project Structure

```
availability-helper/
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── api/        # API routes
│   │   ├── auth/       # Authentication pages
│   │   └── dashboard/  # Protected pages
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utilities and configurations
│   └── types/         # TypeScript type definitions
├── prisma/            # Database schema and migrations
├── public/            # Static assets
└── docs/              # Additional documentation
```

## API Documentation

### Authentication
- NextAuth.js handles OAuth with Google/GitHub
- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/session` - Get current session

### Group Endpoints
- `POST /groups` - Create group
- `GET /groups` - List user's groups
- `GET /groups/:id` - Get group details
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group

### Invitation Endpoints
- `POST /groups/:id/invites` - Send invitation
- `GET /invites/:token` - Get invitation details
- `POST /invites/:token/accept` - Accept invitation
- `POST /invites/:token/decline` - Decline invitation

### Event Endpoints
- `POST /groups/:id/events` - Create event
- `GET /groups/:id/events` - List group events
- `GET /events/:id` - Get event details
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.