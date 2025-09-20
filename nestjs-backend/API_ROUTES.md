# NestJS Backend API Routes

This document lists all the API routes currently implemented in the NestJS backend.

## General Application

- `GET /` - Provides basic API information and a list of available endpoints.
- `GET /health` - Returns the health status of the application and its dependencies.

## Authentication

- `POST /auth/login` - Authenticates a user and returns a JWT token.

## User Routes (Auto-scoped to authenticated user - No ID required)

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
- `GET /user/claims/active` - Get user's active claims only
- `GET /user/claims/:id` - Get specific claim details (only if user owns it)
- `GET /user/claims/:id/history` - Get claim history (only if user owns it)

### Premium Management (User sees only their premium data)
- `POST /user/premium/calculate` - Calculate premium for a policy
- `GET /user/premium/history` - Get user's premium history across all policies
- `GET /user/premium/policy/:policyId` - Get premium history for specific user policy

### Chat Functionality
- `POST /user/chat` - Send chat message
- `GET /user/chat/history` - Get user's chat history
- `GET /user/chat/history/:sessionId` - Get specific chat session

### Claim History (Auto-scoped to user)
- `GET /user/claim-history` - Get user's complete claim history
- `GET /user/claim-history/claim/:claimId` - Get history for specific user claim

## Admin Routes (Admin Only - IDs required for managing any entity)

### User Management
- `GET /admin/users` - List all users
- `POST /admin/users` - Create new user
- `GET /admin/users/:id` - Get specific user details
- `GET /admin/users/:id/policies` - Get user's policies
- `GET /admin/users/:id/claims` - Get user's claims

### Policy Management (Any policy in system)
- `GET /admin/policies` - List all policies
- `POST /admin/policies` - Create policy
- `GET /admin/policies/:id` - Get specific policy details

### Claims Management (Any claim in system)
- `GET /admin/claims` - List all claims
- `GET /admin/claims/:id` - Get specific claim details
- `POST /admin/claims/:id/status` - Update claim status
- `DELETE /admin/claims/:id` - Delete claim

### System Management
- `POST /admin/kb` - Upload knowledge base
- `DELETE /admin/kb/:id` - Delete knowledge base entry
- `GET /admin/statistics` - Get system statistics
- `GET /admin/statistics/users` - Get user statistics
- `GET /admin/statistics/policies` - Get policy statistics
- `GET /admin/statistics/claims` - Get claim statistics

### Premium Management (System-wide)
- `GET /admin/premium/history` - Get all premium history
- `GET /admin/premium/policy/:policyId` - Get premium history for any policy

## Shared Routes (Context-aware behavior based on user role)

### Policies
- `GET /policies/:id` - Users: only their own policies, Admins: any policy

### Claims
- `GET /claims/:id` - Users: only their own claims, Admins: any claim
- `GET /claims` - Users: only their claims, Admins: all claims

### Premium
- `GET /premium/:policyId` - Users: only their policy premium, Admins: any policy premium

### Claim History
- `GET /claim-history/claim/:claimId` - Users: only their claim history, Admins: any claim history

### Chat (Admin only)
- `GET /chat/statistics` - Get chat usage statistics
