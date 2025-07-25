# Go-Cab API Documentation

## User Registration Endpoint

Register a new user in the system.

### Endpoint

```http
POST /api/users/register
```

### Description

Creates a new user account with the provided details. The endpoint validates the input data, checks for existing users with the same email, and returns an authentication token upon successful registration.

### Request

#### Headers

```http
Content-Type: application/json
```

#### Body Parameters

| Parameter | Type   | Required | Description                                          |
|-----------|--------|----------|------------------------------------------------------|
| name      | object | Yes      | User's name object                                   |
| name.firstName | string | Yes | First name (minimum 2 characters)                    |
| name.lastName  | string | No  | Last name (minimum 2 characters if provided)         |
| email     | string | Yes      | User's email address (must be valid email format)    |
| password  | string | Yes      | User's password (minimum 6 characters)               |

#### Example Request

```json
{
  "name": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Response

#### Success Response

**Code:** 201 CREATED

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

**Code:** 400 BAD REQUEST
- When validation fails
```json
{
  "errors": [
    {
      "msg": "Name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

- When user already exists
```json
{
  "message": "User already exists"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "message": "Server error"
}
```

### Validation Rules

- **firstName**: Minimum 2 characters
- **lastName**: Minimum 2 characters (if provided)
- **email**: Must be a valid email format and unique in the system
- **password**: Minimum 6 characters

### Notes

- The password is automatically hashed before storing in the database
- A JWT token is generated and returned upon successful registration
- The token contains the user's ID and can be used for authenticated requests
- Make sure to store the JWT_SECRET in your environment variables
