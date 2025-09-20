# NestJS Backend API Routes

This document lists all the API routes currently implemented in the NestJS backend.

## General Application

- `GET /` - Provides basic API information and a list of available endpoints.
- `GET /health` - Returns the health status of the application and its dependencies.

## Authentication

- `POST /auth/login` - Authenticates a user and returns a JWT token.

## Chat

- `POST /chat` - Sends a user message to be forwarded to the orchestrator.

## Claims

- `GET /claims/:id` - Retrieves a specific claim by its ID.
- `POST /claims` - Creates a new insurance claim.
- `GET /claims` - Retrieves a list of claims, optionally filtered by policy ID.
- `PATCH /claims/:id/status` - Updates the status of a specific claim.
- `DELETE /claims/:id` - Deletes a specific claim.

## Premium

- `POST /premium/calc` - Calculates the premium based on policy details.
- `GET /premium/:policyId` - Retrieves the premium history for a specific policy.

## Admin

- `POST /admin/kb` - Uploads a file to the knowledge base.
- `DELETE /admin/kb/:id` - Deletes a specific entry from the knowledge base.

## Users

- `GET /users` - Retrieves a list of all users.
- `GET /users/:id` - Retrieves a specific user by their ID.
- `POST /users` - Creates a new user.
- `PATCH /users/:id/email` - Updates a user's email.
- `DELETE /users/:id` - Deletes a user and cascades to their policies/claims.
- `GET /users/statistics` - Gets user statistics (total counts, role counts, recent registrations).

## Policies

- `POST /policies` - Creates a new policy for a user.
- `GET /policies/:id` - Retrieves a specific policy by its ID.
- `GET /policies/user/:userId` - Retrieves all policies for a specific user.
- `PATCH /policies/:id` - Updates details of an existing policy (plan, coverage, etc.).
- `DELETE /policies/:id` - Cancels/Deletes a policy.

## Claim History

- `GET /claim-history/user/:userId` - Retrieves the complete claim history for a given user, across all their policies.
- `GET /claim-history/:claimId` - Retrieves detailed information for a single claim, including its full history and status.
