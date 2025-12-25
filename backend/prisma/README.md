# Database Schema and Setup

This directory contains the Prisma schema and related files for the comment system database.

## Schema Overview

The database schema includes the following models:

### User
- **id**: Unique identifier (ObjectId)
- **email**: Unique email address for authentication
- **username**: Unique username
- **name**: Optional display name
- **password**: Hashed password
- **createdAt**: Timestamp when the user was created
- **updatedAt**: Timestamp when the user was last updated

### Comment
- **id**: Unique identifier (ObjectId)
- **content**: The comment text content
- **authorId**: Reference to the User who wrote the comment
- **parentId**: Optional reference to a parent Comment (for nested comments)
- **createdAt**: Timestamp when the comment was created
- **updatedAt**: Timestamp when the comment was last updated

### Reply
- **id**: Unique identifier (ObjectId)
- **content**: The reply text content
- **authorId**: Reference to the User who wrote the reply
- **commentId**: Reference to the Comment being replied to
- **parentId**: Optional reference to a parent Reply (for nested replies)
- **createdAt**: Timestamp when the reply was created
- **updatedAt**: Timestamp when the reply was last updated

### Like
- **id**: Unique identifier (ObjectId)
- **userId**: Reference to the User who liked the content
- **commentId**: Optional reference to a Comment that was liked
- **replyId**: Optional reference to a Reply that was liked
- **createdAt**: Timestamp when the like was created

## Relationships

- User to Comment: One-to-many
- User to Reply: One-to-many
- User to Like: One-to-many
- Comment to Like: One-to-many
- Comment to Comment: Self-referencing (for nested comments)
- Reply to Like: One-to-many
- Reply to Reply: Self-referencing (for nested replies)

## Indexes

The schema includes indexes on frequently queried fields:
- User: email, username
- Comment: authorId, createdAt, parentId
- Reply: authorId, commentId, createdAt, parentId
- Like: userId, commentId, replyId

## Database Connection

The database connection is configured in `src/config/database.ts` using Prisma Client. The connection is established when the server starts and properly closed on graceful shutdown.

## Seed Data

Seed data can be generated using the `seed.ts` file. To run the seed script:

```bash
npm run prisma:seed
```

This will create:
- 3 sample users with hashed passwords
- 3 sample comments
- Several replies to the comments
- Various likes on comments and replies

## Commands

- `npm run prisma:generate`: Generate Prisma Client
- `npm run prisma:studio`: Open Prisma Studio for database visualization
- `npm run prisma:seed`: Populate the database with seed data