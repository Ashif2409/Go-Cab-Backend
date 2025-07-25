# Go-Cab API Documentation

## User Authentication Endpoints

### 1. User Registration

Register a new user in the system.

### Endpoint

```http
POST /api/users/register
```
#### Notes

- The password is compared with the hashed password in the database
- A JWT token is generated upon successful authentication
- The token is sent both in the response body and as an HTTP-only cookie
- The token contains the user's ID and can be used for authenticated requests
- Make sure to store the JWT_SECRET in your environment variables

### 3. Get User Profile

Retrieve the authenticated user's profile information.

#### Endpoint

```http
GET /api/users/profile
```

#### Description

Retrieves the profile information of the currently authenticated user. This endpoint requires authentication using a JWT token.

#### Request

##### Headers

```http
Authorization: Bearer <your_jwt_token>
```
OR
```http
Cookie: token=<your_jwt_token>
```

Either include the token in the Authorization header or as a cookie. The cookie is automatically set after login.

##### Parameters

No body parameters required. The user is identified from the JWT token.

#### Response

##### Success Response

**Code:** 200 OK

```json
{
  "user": {
    "_id": "user_id_here",
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  }
}
```

##### Error Responses

**Code:** 401 UNAUTHORIZED

- When no token is provided
```json
{
  "message": "No token provided, authorization denied"
}
```

- When token is invalid
```json
{
  "message": "Token is not valid"
}
```

- When user not found
```json
{
  "message": "User not found"
}
```

- When token payload is invalid
```json
{
  "message": "Token payload invalid"
}
```

#### Security

- Requires a valid JWT token obtained from login or registration
- Token can be sent via Authorization header or cookie
- Token is validated and decoded to fetch the user information
- User's existence is verified in the database for each request

#### Response Fields

| Field           | Type   | Description                                    |
|-----------------|--------|------------------------------------------------|
| _id             | string | User's unique identifier                       |
| name.firstName  | string | User's first name                             |
| name.lastName   | string | User's last name (empty string if not set)    |
| email           | string | User's email address                          |
| socketId        | string | null (Used for real-time communication)       |

#### Notes

- The endpoint uses the same JWT token used for authentication
- Password and sensitive information are excluded from the response
- The response includes basic user profile information
- Socket ID is included for real-time featuresescription

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

### 2. User Login

Authenticate an existing user and get an access token.

#### Endpoint

```http
POST /api/users/login
```

#### Description

Authenticates a user with their email and password, and returns an authentication token upon successful login. The token is also set as an HTTP-only cookie.

#### Request

##### Headers

```http
Content-Type: application/json
```

##### Body Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| email     | string | Yes      | User's registered email address|
| password  | string | Yes      | User's password               |

##### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

#### Response

##### Success Response

**Code:** 200 OK

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### Error Responses

**Code:** 401 UNAUTHORIZED
- When credentials are invalid
```json
{
  "message": "Invalid credentials"
}
```

**Code:** 400 BAD REQUEST
- When validation fails
```json
{
  "errors": [
    {
      "msg": "Valid email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "message": "Server error"
}
```

#### Notes

- The provided password is compared with the hashed password in the database
- A JWT token is generated upon successful authentication
- The token is sent both in the response body and as an HTTP-only cookie
- The token contains the user's ID and can be used for authenticated requests
- Make sure to store the JWT_SECRET in your environment variables
