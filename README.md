# Go-Cab API Documentation

## User Authentication Endpoints

### 1. User Registration

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

### 3. Get User Profile

Get the authenticated user's profile information.

#### Endpoint

```http
GET /api/users/profile
```

#### Description

Returns the profile information of the currently authenticated user. This endpoint requires authentication using a JWT token.

#### Request

##### Headers

```http
Authorization: Bearer <your_jwt_token>
```
OR
```http
Cookie: token=<your_jwt_token>
```

Either include the token in the Authorization header or as a cookie (automatically set after login).

##### Parameters

No body parameters required. The user is identified from the JWT token.

#### Response

##### Success Response

**Code:** 200 OK

```json
{
  "_id": "user_id_here",
  "name": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "email": "john.doe@example.com",
  "socketId": null
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

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "message": "Server error"
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

- The endpoint is protected by the authentication middleware
- Password and sensitive information are excluded from the response
- The response includes basic user profile information
- Socket ID is included for real-time features
- Make sure to include the token in the request headers or cookies

### 4. User Logout

Logout the currently authenticated user and invalidate their token.

## Driver Endpoints

### 1. Driver Registration

Register a new driver in the system.

#### Endpoint

```http
POST /api/drivers/register
```

#### Description

Creates a new driver account with the provided details including vehicle information and initial location. The endpoint validates the input data and returns an authentication token upon successful registration.

#### Request

##### Headers

```http
Content-Type: application/json
```

##### Body Parameters

| Parameter | Type   | Required | Description                                          |
|-----------|--------|----------|------------------------------------------------------|
| name      | object | Yes      | Driver's name object                                 |
| name.firstName | string | Yes | First name (minimum 2 characters)                    |
| name.lastName  | string | No  | Last name (minimum 2 characters if provided)         |
| email     | string | Yes      | Driver's email address (must be valid email format)  |
| password  | string | Yes      | Password (minimum 6 characters)                      |
| vehicle   | object | Yes      | Vehicle information                                  |
| vehicle.color | string | Yes  | Color of the vehicle (minimum 3 characters)          |
| vehicle.plate | string | Yes  | Vehicle plate number (minimum 3 characters)          |
| vehicle.capacity | number | Yes| Vehicle passenger capacity (minimum 1)              |
| vehicle.vehicleType | string | Yes | Type of vehicle ('car', 'bike', or 'auto')     |
| location  | object | Yes      | Initial location coordinates                         |
| location.lat | number | Yes   | Latitude coordinate                                  |
| location.lng | number | Yes   | Longitude coordinate                                 |
| status    | string | Yes      | Initial driver status ('active' or 'inactive')       |

##### Example Request

```json
{
  "name": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "email": "john.driver@example.com",
  "password": "password123",
  "vehicle": {
    "color": "Black",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  },
  "location": {
    "lat": 12.9716,
    "lng": 77.5946
  },
  "status": "inactive"
}
```

#### Response

##### Success Response

**Code:** 201 CREATED

```json
{
  "message": "Driver registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### Error Responses

**Code:** 400 BAD REQUEST
- When validation fails
```json
{
  "errors": [
    {
      "msg": "Vehicle color is required",
      "param": "vehicle.color",
      "location": "body"
    }
  ]
}
```

- When driver already exists
```json
{
  "message": "Driver already exists"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "message": "Server error"
}
```

#### Validation Rules

- **firstName**: Minimum 2 characters
- **lastName**: Minimum 2 characters (if provided)
- **email**: Must be a valid email format and unique in the system
- **password**: Minimum 6 characters
- **vehicle.color**: Minimum 3 characters
- **vehicle.plate**: Minimum 3 characters
- **vehicle.capacity**: Minimum value of 1
- **vehicle.vehicleType**: Must be one of: 'car', 'bike', 'auto'
- **location.lat**: Must be a valid float number
- **location.lng**: Must be a valid float number
- **status**: Must be either 'active' or 'inactive'

#### Notes

- The password is automatically hashed before storing in the database
- A JWT token is generated and returned upon successful registration
- The token contains the driver's ID and can be used for authenticated requests
- Vehicle information is required and validated
- Initial location coordinates are required for tracking
- Initial status is typically set to 'inactive'
- Make sure to store the JWT_SECRET in your environment variables

#### Endpoint

```http
POST /api/users/logout
```

#### Description

Logs out the user by invalidating their current JWT token and clearing the cookie. The token is added to a blacklist to prevent its reuse. This endpoint requires authentication.

#### Request

##### Headers

```http
Authorization: Bearer <your_jwt_token>
```
OR
```http
Cookie: token=<your_jwt_token>
```

Either include the token in the Authorization header or as a cookie.

##### Parameters

No body parameters required. The token is obtained from the request headers or cookies.

#### Response

##### Success Response

**Code:** 200 OK

```json
{
  "message": "Logout successful"
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

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "message": "Server error"
}
```

#### Security

- Requires a valid JWT token obtained from login or registration
- Token can be sent via Authorization header or cookie
- The provided token is blacklisted to prevent reuse
- Blacklisted tokens are automatically removed after 24 hours
- Cookie containing the token is cleared upon successful logout

#### Notes

- The endpoint is protected by the authentication middleware
- The token is added to a blacklist collection in the database
- The blacklist has an automatic cleanup after 24 hours
- The HTTP-only cookie is cleared from the client
- After logout, the token can no longer be used for authentication
