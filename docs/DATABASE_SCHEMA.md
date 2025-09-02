# Database Schema

This document outlines the database schema for the Availability Helper application using Prisma ORM.

## Prisma Schema

The following Prisma schema defines all models and relationships:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  emailVerified DateTime? @map("email_verified")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relationships
  ownedGroups            Group[]                  @relation("GroupOwner")
  groupMemberships       GroupMember[]
  sentInvites            Invite[]                 @relation("InviteSender")
  createdEvents          Event[]                  @relation("EventCreator")
  availabilityResponses  AvailabilityResponse[]

  @@map("users")
}

model Group {
  id          String   @id @default(cuid())
  name        String
  description String?
  ownerId     String   @map("owner_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relationships
  owner    User          @relation("GroupOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members  GroupMember[]
  invites  Invite[]
  events   Event[]

  @@map("groups")
}

model GroupMember {
  id       String    @id @default(cuid())
  groupId  String    @map("group_id")
  userId   String    @map("user_id")
  role     Role      @default(MEMBER)
  joinedAt DateTime  @default(now()) @map("joined_at")

  // Relationships
  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
  @@map("group_members")
}

model Invite {
  id         String       @id @default(cuid())
  groupId    String       @map("group_id")
  email      String
  invitedBy  String       @map("invited_by")
  token      String       @unique
  status     InviteStatus @default(PENDING)
  expiresAt  DateTime     @map("expires_at")
  createdAt  DateTime     @default(now()) @map("created_at")
  acceptedAt DateTime?    @map("accepted_at")

  // Relationships
  group   Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  inviter User  @relation("InviteSender", fields: [invitedBy], references: [id], onDelete: Cascade)

  @@unique([groupId, email])
  @@map("invites")
}

model Event {
  id          String    @id @default(cuid())
  groupId     String    @map("group_id")
  title       String
  description String?
  eventDate   DateTime  @map("event_date") @db.Date
  startTime   DateTime? @map("start_time") @db.Time
  endTime     DateTime? @map("end_time") @db.Time
  location    String?
  createdBy   String    @map("created_by")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relationships
  group                 Group                    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  creator               User                     @relation("EventCreator", fields: [createdBy], references: [id], onDelete: Cascade)
  availabilityResponses AvailabilityResponse[]

  @@map("events")
}

model AvailabilityResponse {
  id          String               @id @default(cuid())
  eventId     String               @map("event_id")
  userId      String               @map("user_id")
  status      AvailabilityStatus
  notes       String?
  respondedAt DateTime             @default(now()) @map("responded_at")

  // Relationships
  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
  @@map("availability_responses")
}

// Enums
enum Role {
  OWNER
  ADMIN
  MEMBER
}

enum InviteStatus {
  PENDING
  ACCEPTED
  DECLINED
  EXPIRED
}

enum AvailabilityStatus {
  AVAILABLE
  UNAVAILABLE
  MAYBE
}
```

## Model Relationships

### User Model
- **One-to-Many**: Users can own multiple groups
- **Many-to-Many**: Users can be members of multiple groups (via GroupMember)
- **One-to-Many**: Users can send multiple invites
- **One-to-Many**: Users can create multiple events
- **One-to-Many**: Users can have multiple availability responses

### Group Model
- **Many-to-One**: Each group has one owner (User)
- **One-to-Many**: Groups can have multiple members (via GroupMember)
- **One-to-Many**: Groups can have multiple invites
- **One-to-Many**: Groups can have multiple events

### GroupMember Model
- **Many-to-One**: Multiple memberships belong to one group
- **Many-to-One**: Multiple memberships belong to one user
- **Composite Unique**: One membership per user per group

### Invite Model
- **Many-to-One**: Multiple invites can belong to one group
- **Many-to-One**: Multiple invites can be sent by one user
- **Composite Unique**: One invite per email per group

### Event Model
- **Many-to-One**: Multiple events belong to one group
- **Many-to-One**: Multiple events created by one user
- **One-to-Many**: Events can have multiple availability responses

### AvailabilityResponse Model
- **Many-to-One**: Multiple responses belong to one event
- **Many-to-One**: Multiple responses belong to one user
- **Composite Unique**: One response per user per event

## Business Rules Enforced by Schema

1. **Email Uniqueness**: Users must have unique email addresses
2. **Group Ownership**: Each group has exactly one owner
3. **Single Membership**: Users can only be members of a group once
4. **Unique Invites**: Only one pending invite per email per group
5. **Single Response**: Users can only respond once per event
6. **Cascading Deletes**: Deleting users/groups removes related data

## Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Create and run migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## Usage Examples

```typescript
// Create user
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    passwordHash: hashedPassword,
  },
});

// Create group with owner
const group = await prisma.group.create({
  data: {
    name: 'Family Group',
    description: 'Our family scheduling',
    ownerId: user.id,
    members: {
      create: {
        userId: user.id,
        role: 'OWNER',
      },
    },
  },
});

// Send invite
const invite = await prisma.invite.create({
  data: {
    groupId: group.id,
    email: 'jane@example.com',
    invitedBy: user.id,
    token: generateSecureToken(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
});

// Create event
const event = await prisma.event.create({
  data: {
    groupId: group.id,
    title: 'Family Dinner',
    description: 'Monthly family gathering',
    eventDate: new Date('2024-01-15'),
    startTime: new Date('2024-01-15T18:00:00'),
    endTime: new Date('2024-01-15T20:00:00'),
    createdBy: user.id,
  },
});

// Respond to event
const response = await prisma.availabilityResponse.create({
  data: {
    eventId: event.id,
    userId: user.id,
    status: 'AVAILABLE',
    notes: 'Looking forward to it!',
  },
});
```