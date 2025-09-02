# Claude Development Guide

This file contains project-specific information for Claude to help with development tasks.

## Project Overview
Availability Helper is a Next.js web application for group scheduling coordination. Users can create groups, invite members via email, and coordinate scheduling within those groups.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Google OAuth)
- **Email**: Resend
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Key Commands
```bash
# Development
npm run dev

# Database
npx prisma db push          # Push schema changes
npx prisma generate         # Generate Prisma client
npx prisma studio          # Database GUI

# Build & Deploy
npm run build
npm run lint
npm run type-check
```

## Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages (sign-in, etc.)
│   └── (dashboard)/       # Protected app pages
├── components/            # Reusable UI components
├── lib/                   # Utilities, configs, database
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   └── email.ts          # Email utilities
└── types/                 # TypeScript definitions

prisma/
├── schema.prisma         # Database schema
```

## Database Schema
Uses Prisma with PostgreSQL. Key models:
- **User**: OAuth user profiles (email, name, image)
- **Group**: User-created groups
- **GroupMember**: Group membership with roles
- **Invite**: Email invitations to join groups
- **Event**: Scheduling events within groups
- **AvailabilityResponse**: User responses to events

## Authentication Flow
1. Users sign in with Google OAuth via NextAuth.js
2. User profile created automatically from OAuth data
3. Session managed by NextAuth (no custom JWT needed)
4. Protected routes use NextAuth session verification

## Email Invitations
1. Group owner invites user by email
2. System generates secure invite token
3. Email sent via Resend with invite link
4. Invitee clicks link → signs in with OAuth → accepts invite

## Development Notes
- Use server components by default, client components when needed
- API routes in `app/api/` follow REST conventions
- Database operations use Prisma client
- Authentication uses NextAuth session helpers
- Email templates kept simple (plain HTML)

## Environment Variables Required
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=random-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=oauth-client-id
GOOGLE_CLIENT_SECRET=oauth-client-secret
RESEND_API_KEY=resend-api-key
```

## Common Patterns

### Protected API Route
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... handle request
}
```

### Database Query
```typescript
import { db } from "@/lib/db";

const groups = await db.group.findMany({
  where: { 
    members: { 
      some: { userId: session.user.id } 
    } 
  },
  include: { members: { include: { user: true } } }
});
```

### Email Sending
```typescript
import { sendEmail } from "@/lib/email";

await sendEmail({
  to: invite.email,
  subject: `Invitation to join ${group.name}`,
  html: `<p>You've been invited to join ${group.name}...</p>`
});
```

## Testing Strategy
- Focus on API route testing
- Test database operations with test database
- Mock email sending in tests
- Use NextAuth test utilities for auth testing