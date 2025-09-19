# NestJS Backend API Routes

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
