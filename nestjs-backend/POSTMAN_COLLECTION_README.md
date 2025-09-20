# Customer Assist Gen AI - Postman Collection

This Postman collection allows you to test the Customer Assist Gen AI application with real data.

## Prerequisites

1. **Install Postman**: Download and install Postman from [https://www.postman.com/](https://www.postman.com/)

2. **Start the Application**: Make sure your NestJS backend is running on `http://localhost:3001`

   ```bash
   cd nestjs-backend
   npm run start:dev
   ```

3. **Database Setup**: Ensure your test database is set up and running

   ```bash
   cd nestjs-backend
   npm run setup:test-db
   ```

## Importing the Collection

1. Open Postman
2. Click on "Import" in the top left corner
3. Select "File" and choose the `Customer_Assist_Gen_AI_Postman_Collection.json` file
4. The collection will be imported with all the API endpoints organized by category

## Collection Structure

The collection is organized into the following folders:

### 🔐 Authentication
- **Login - Admin User**: Login as admin user (admin@test.com / secret)
- **Login - Regular User**: Login as regular user (john.doe@test.com / secret)
- **Login - Invalid Credentials**: Test with wrong credentials

### 👥 Users
- **Get All Users**: Retrieve all users (requires admin privileges)
- **Get User by ID**: Get specific user details
- **Create New User**: Create a new user account
- **Update User Email**: Update user's email address
- **Delete User**: Delete a user (cascades to policies and claims)
- **Get User Statistics**: Get user analytics and statistics

### 📋 Policies
- **Create Gold Policy**: Create a Gold insurance policy with comprehensive coverage
- **Create Silver Policy**: Create a Silver insurance policy with essential coverage
- **Get Policy by ID**: Retrieve specific policy details
- **Get Policies by User**: Get all policies for a specific user
- **Update Policy**: Modify policy details (coverage, premium, etc.)
- **Delete Policy**: Cancel or delete a policy

### 🚨 Claims
- **Create New Claim**: File a new insurance claim with photos and details
- **Get Claim by ID**: Retrieve specific claim information
- **Get All Claims**: Get all claims (admin access required)
- **Get Claims by Policy**: Get claims filtered by policy ID
- **Update Claim Status**: Change claim status (e.g., "Under Review", "Approved")
- **Delete Claim**: Remove a claim from the system

### 💰 Premium
- **Calculate Premium**: Calculate premium based on coverage changes
- **Get Premium History**: Retrieve premium history for a specific policy

### 💬 Chat
- **Send Chat Message**: Send a message to the AI chat service
- **Send Chat Message - New Session**: Start a new chat session

### 🔧 Admin
- **Upload Knowledge Base File**: Upload documents to the knowledge base
- **Delete Knowledge Base Entry**: Remove entries from the knowledge base

### 📊 Claim History
- **Get User Claim History**: Get complete claim history for a user
- **Get Claim Details**: Get detailed information for a specific claim

### 🏥 System
- **Health Check**: Check system health and dependencies
- **API Info**: Get basic API information and available endpoints

## Environment Variables

The collection uses the following environment variables:

- `base_url`: Base URL of the API (default: `http://localhost:3001`)
- `jwt_token`: JWT token for authentication (automatically set after login)

### Setting Up Environment Variables

1. In Postman, click on the gear icon (⚙️) in the top right corner
2. Go to "Variables" tab
3. Set the `base_url` to your API endpoint (default is `http://localhost:3001`)
4. The `jwt_token` will be automatically set when you run the login requests

## Authentication Flow

1. **Start with Login**: Run either "Login - Admin User" or "Login - Regular User"
2. **Token Storage**: The login request automatically stores the JWT token in the `jwt_token` variable
3. **Use Token**: All subsequent requests will automatically use the stored token for authentication

## Test Data

The collection uses the following test data:

### Users
- Admin: `admin@test.com` / `secret`
- Regular User: `john.doe@test.com` / `secret`
- Support: `support@test.com` / `secret`

### Policy IDs
- Gold Policies: `GOLD-001`, `GOLD-002`, etc.
- Silver Policies: `SILVER-001`, `SILVER-002`, etc.

### Claim IDs
- Claims: `CLM-001`, `CLM-002`, etc.

## Sample Request Bodies

### Creating a Gold Policy
```json
{
  "user_id": "1",
  "plan_name": "Gold",
  "collision_coverage": 300000,
  "roadside_assistance": true,
  "deductible": 500,
  "premium": 2500
}
```

### Filing a Claim
```json
{
  "policyId": "GOLD-001",
  "description": "Car accident on highway - rear-ended by another vehicle",
  "vehicle": "Toyota Camry 2020, License: ABC123",
  "photos": ["photo1.jpg", "photo2.jpg", "damage_report.pdf"]
}
```

### Calculating Premium
```json
{
  "policy_id": "GOLD-001",
  "previous_coverage": 250000,
  "new_coverage": 350000
}
```

### Sending Chat Message
```json
{
  "message": "What is covered in my Gold policy?",
  "sessionId": "session-123"
}
```

## Running Tests

The collection includes test scripts for key endpoints:

1. **Login Tests**: Automatically verify successful login and store JWT token
2. **Status Code Tests**: Verify correct HTTP status codes
3. **Response Validation**: Check for expected response fields

To run tests:
1. Select a request or folder
2. Click on the "Runner" tab (▶️)
3. Select the requests you want to test
4. Click "Run [Collection Name]"

## File Upload

For the "Upload Knowledge Base File" request:
1. Go to the "Body" tab
2. Select "form-data"
3. Click on "Choose Files" next to the "file" field
4. Select a PDF, DOC, DOCX, TXT, or MD file (max 10MB)

## Common Use Cases

### 1. Complete User Flow
1. Login as a regular user
2. Create a new policy
3. File a claim against the policy
4. Check claim status
5. Get claim history

### 2. Admin Operations
1. Login as admin user
2. Get all users and statistics
3. Upload knowledge base documents
4. Manage user accounts

### 3. Policy Management
1. Create different types of policies
2. Calculate premium changes
3. Update policy details
4. Cancel policies

### 4. Claims Processing
1. File new claims with photos
2. Update claim statuses
3. Get claims by policy
4. View claim history

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Make sure you've run a login request first and the JWT token is set
2. **404 Not Found**: Verify the resource ID exists in the database
3. **400 Bad Request**: Check the request body format and required fields
4. **500 Internal Server Error**: Check the server logs for detailed error information

### Database Issues

If you encounter database-related errors:
1. Ensure PostgreSQL is running
2. Verify the test database exists
3. Run the database setup script:
   ```bash
   npm run setup:test-db
   ```

### Server Issues

If the server is not responding:
1. Check if the NestJS application is running
2. Verify the port (default: 3001)
3. Check the application logs for errors

## API Documentation

For detailed API documentation, refer to the `API_ROUTES.md` file in the project root.

## Support

If you encounter any issues with the Postman collection:
1. Check the application logs for error details
2. Verify the database connection and setup
3. Ensure all environment variables are correctly set
4. Review the request bodies and authentication headers

---

**Note**: This collection is designed for testing and development purposes. For production use, ensure proper security measures and environment configurations are in place.
