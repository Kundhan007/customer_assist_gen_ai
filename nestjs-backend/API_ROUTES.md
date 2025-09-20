# Lean System API Routes

This document lists all the API routes implemented in the lean system.

## Authentication

- `POST /auth/login` - Authenticates a user and returns a JWT token.

## User Routes (Auto-scoped to authenticated user)

### Profile Management
- `GET /user/profile` - Get user's own profile
- `PATCH /user/profile` - Update user's own profile

### Policy Management (User sees only their policies)
- `GET /user/policies` - Get user's policies
- `GET /user/policies/active` - Get user's active policies only
- `GET /user/policies/:id` - Get specific policy details (only if user owns it)

### Claims Management (User sees only their claims)
- `POST /user/claims` - Create new claim (auto-associated with user)
- `GET /user/claims` - Get user's claims
- `GET /user/claims/:id` - Get specific claim details (only if user owns it)

### Premium Management
- `POST /user/premium/calculate` - Calculate premium for a policy

### Chat Functionality
- `POST /user/chat` - Send chat message

## Chat Routes

### Chat Orchestrator
- `POST /chat/send` - Send a chat message to the orchestrator

## Admin Routes (Admin Only)

### User Management
- `GET /admin/users` - List all users
- `POST /admin/users` - Create new user
- `GET /admin/users/:id` - Get specific user details

### Policy Management
- `GET /admin/policies` - List all policies
- `POST /admin/policies` - Create policy

### System Management
- `POST /admin/kb` - Upload knowledge base
- `DELETE /admin/kb/:id` - Delete knowledge base entry
