# Go-Cab API Documentation

## User Authentication Endpoints

### 1. User Registration

Register a new user in the system.

### Endpoint

```http
POST /api/users/register
```

### Description

Creates a new user account with the provided details. The endpoint validates the input data, #### Notes

- The endpoint is protected by the driver authentication middleware
- Password and sensitive information are excluded from the response
- The response includes basic user profile information
- Socket ID is included for real-time features
- Make sure to include the token in the request headers or cookies

### 4. Driver Logout

Logout the currently authenticated driver and invalidate their token.

#### Endpoint

```http
POST /api/drivers/logout
```

#### Description

Logs out the driver by invalidating their current JWT token and clearing the cookie. The token is added to a blacklist to prevent its reuse. This endpoint requires authentication.

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
  "message": "Driver logged out successfully"
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

- When driver not found
```json
{
  "message": "Driver not found"
}
```

- When token is already blacklisted
```json
{
  "message": "Token is blacklisted, authorization denied"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "message": "Server error"
}
```

#### Security

- Requires a valid JWT token obtained from driver login or registration
- Token can be sent via Authorization header or cookie
- The provided token is blacklisted to prevent reuse
- Blacklisted tokens are automatically removed after 24 hours
- Cookie containing the token is cleared upon successful logout

#### Notes

- The endpoint is protected by the driver authentication middleware
- The token is added to a blacklist collection in the database
- The blacklist has an automatic cleanup after 24 hours
- The HTTP-only cookie is cleared from the client
- After logout, the token can no longer be used for authentication

## Map Endpoints

### 1. Get Coordinates

Convert an address into geographic coordinates using Google Maps Geocoding API.

#### Endpoint

```http
GET /api/maps/get-coordinates
```

#### Description

Converts a text address into latitude and longitude coordinates using Google Maps Geocoding API. This endpoint requires authentication and validates the address parameter.

#### Request

##### Headers

```http
Authorization: Bearer <your_jwt_token>
```
OR
```http
Cookie: token=<your_jwt_token>
```

##### Query Parameters

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| address   | string | Yes      | The address to convert (minimum 3 characters)   |

##### Example Request

```http
GET /api/maps/get-coordinates?address=Times Square, New York
```

#### Response

##### Success Response

**Code:** 200 OK

```json
{
  "lat": 40.7580,
  "lng": -73.9855
}
```

##### Error Responses

**Code:** 400 BAD REQUEST
- When validation fails
```json
{
  "errors": [
    {
      "msg": "Address must be at least 3 characters long",
      "param": "address",
      "location": "query"
    }
  ]
}
```

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

- When token is blacklisted
```json
{
  "message": "Token is blacklisted, authorization denied"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "error": "Failed to fetch coordinates"
}
```

#### Security

- Requires a valid JWT token for authentication
- Token can be sent via Authorization header or cookie
- Protected by user authentication middleware
- Requires valid Google Maps API key in environment variables

#### Notes

- Uses Google Maps Geocoding API for coordinate conversion
- Requires GOOGLE_MAP_API environment variable to be set
- Address parameter must be URL encoded
- Returns precise latitude and longitude coordinates
- Error handling for invalid addresses and API failures
- Rate limiting may apply based on Google Maps API quota

### 2. Get Distance and Time

Calculate the distance and travel time between two locations using Google Maps Distance Matrix API.

#### Endpoint

```http
GET /api/maps/get-distance-time
```

#### Description

Calculates the travel distance and estimated duration between two locations. This endpoint requires authentication and uses Google Maps Distance Matrix API.

#### Request

##### Headers

```http
Authorization: Bearer <your_jwt_token>
```
OR
```http
Cookie: token=<your_jwt_token>
```

##### Query Parameters

| Parameter    | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| origin      | string | Yes      | Starting location address            |
| destination | string | Yes      | Ending location address              |

##### Example Request

```http
GET /api/maps/get-distance-time?origin=Delhi Jama Masjid&destination=Cyber city Gurgaon
```

#### Response

##### Success Response

**Code:** 200 OK

```json
{
  "distance": "32.5 km",
  "duration": "1 hour 15 mins"
}
```

##### Error Responses

**Code:** 400 BAD REQUEST
- When validation fails
```json
{
  "errors": [
    {
      "msg": "Origin must be a valid address",
      "param": "origin",
      "location": "query"
    }
  ]
}
```

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

- When token is blacklisted
```json
{
  "message": "Token is blacklisted, authorization denied"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "error": "Failed to fetch distance and time"
}
```

#### Security

- Requires a valid JWT token for authentication
- Token can be sent via Authorization header or cookie
- Protected by user authentication middleware
- Requires valid Google Maps API key in environment variables

#### Notes

- Uses Google Maps Distance Matrix API
- Both origin and destination addresses must be valid
- Returns distance in kilometers and duration in human-readable format
- Considers current traffic conditions (if available)
- Results may vary based on time of day and traffic
- All addresses should be URL encoded
- Rate limiting may apply based on Google Maps API quota
- Distance and time calculations consider the optimal driving route

## Ride Endpoints

### 1. Create Ride

Create a new ride request in the system.

#### Endpoint

```http
POST /api/ride/create-ride
```

#### Description

Creates a new ride request with the specified pickup location, dropoff location, and vehicle type. The endpoint calculates the fare based on distance and duration, generates an OTP for ride verification, and assigns a pending status to the ride.

#### Request

##### Headers

```http
Authorization: Bearer <your_jwt_token>
```
OR
```http
Cookie: token=<your_jwt_token>
```

##### Body Parameters

| Parameter       | Type   | Required | Description                                     |
|----------------|--------|----------|-------------------------------------------------|
| pickupLocation | string | Yes      | Starting location address                       |
| dropoffLocation| string | Yes      | Destination address                            |
| vehicleType    | string | Yes      | Type of vehicle ('car', 'bike', or 'auto')    |

##### Example Request

```json
{
  "pickupLocation": "Delhi Jama Masjid",
  "dropoffLocation": "Cyber city Gurgaon",
  "vehicleType": "car"
}
```

#### Response

##### Success Response

**Code:** 201 CREATED

```json
{
  "_id": "ride_id",
  "userId": "user_id",
  "pickupLocation": "Delhi Jama Masjid",
  "destination": "Cyber city Gurgaon",
  "fare": 450,
  "status": "pending",
  "duration": 75,
  "distance": 32.5,
  "OTP": 123456
}
```

##### Error Responses

**Code:** 400 BAD REQUEST
- When validation fails
```json
{
  "errors": [
    {
      "msg": "Pickup location is required",
      "param": "pickupLocation"
    }
  ]
}
```

**Code:** 401 UNAUTHORIZED
- When no token is provided
```json
{
  "message": "No token provided, authorization denied"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "error": "Failed to create ride"
}
```

#### Security

- Requires a valid JWT token for authentication
- Token can be sent via Authorization header or cookie
- Protected by user authentication middleware

#### Notes

- Fare is calculated based on:
  - Base fare (Car: ₹50, Auto: ₹30, Bike: ₹20)
  - Per kilometer rate (Car: ₹15/km, Auto: ₹10/km, Bike: ₹7/km)
  - Time factor (Car: ₹2/min, Auto: ₹1/min, Bike: ₹0.7/min)
- A 6-digit OTP is generated for ride verification
- Initial ride status is set to 'pending'
- Distance and duration are calculated using Google Maps API
- All addresses should be valid and recognizable by Google Maps

### 3. Get Address Suggestions

Get address suggestions as you type using Google Maps Places Autocomplete API.

#### Endpoint

```http
GET /api/maps/get-suggestions
```

#### Description

Provides address suggestions based on user input using Google Maps Places Autocomplete API. This endpoint requires authentication and helps users input valid addresses.

#### Request

##### Headers

```http
Authorization: Bearer <your_jwt_token>
```
OR
```http
Cookie: token=<your_jwt_token>
```

##### Query Parameters

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| input     | string | Yes      | Text to get address suggestions (min 3 chars)   |

##### Example Request

```http
GET /api/maps/get-suggestions?input=Times Square
```

#### Response

##### Success Response

**Code:** 200 OK

```json
[
  "Times Square, Manhattan, New York, NY, USA",
  "Times Square–42nd Street/Port Authority Bus Terminal, New York, NY, USA",
  "Times Square Church, West 51st Street, New York, NY, USA"
]
```

##### Error Responses

**Code:** 400 BAD REQUEST
- When validation fails
```json
{
  "errors": [
    {
      "msg": "Input must be a string with at least 3 characters",
      "param": "input",
      "location": "query"
    }
  ]
}
```

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

- When token is blacklisted
```json
{
  "message": "Token is blacklisted, authorization denied"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "error": "Failed to fetch autocomplete suggestions"
}
```

#### Security

- Requires a valid JWT token for authentication
- Token can be sent via Authorization header or cookie
- Protected by user authentication middleware
- Requires valid Google Maps API key in environment variables

#### Notes

- Uses Google Maps Places Autocomplete API
- Minimum 3 characters required for suggestions
- Returns an array of address suggestions
- Suggestions are sorted by relevance
- Results include full formatted addresses
- Input should be URL encoded
- Rate limiting may apply based on Google Maps API quota
- Useful for ensuring valid addresses in other endpointsfor existing users with the same email, and returns an authentication token upon successful registration.

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

### 2. Driver Login

Authenticate an existing driver and get an access token.

#### Endpoint

```http
POST /api/drivers/login
```

#### Description

Authenticates a driver with their email and password, and returns an authentication token upon successful login. The token is also set as an HTTP-only cookie.

#### Request

##### Headers

```http
Content-Type: application/json
```

##### Body Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| email     | string | Yes      | Driver's registered email address|
| password  | string | Yes      | Driver's password               |

##### Example Request

```json
{
  "email": "john.driver@example.com",
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
- The token contains the driver's ID and can be used for authenticated requests
- The token can be used for driver-specific operations
- Make sure to store the JWT_SECRET in your environment variables

### 3. Get Driver Profile

Get the authenticated driver's profile information including vehicle and location details.

#### Endpoint

```http
GET /api/drivers/profile
```

#### Description

Returns the complete profile information of the currently authenticated driver including their personal details, vehicle information, current location, and status. This endpoint requires authentication using a JWT token.

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

No body parameters required. The driver is identified from the JWT token.

#### Response

##### Success Response

**Code:** 200 OK

```json
{
  "message": "Driver profile fetched successfully",
  "driver": {
    "_id": "driver_id_here",
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john.driver@example.com",
    "socketId": null,
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
    "status": "active"
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

- When driver not found
```json
{
  "message": "Driver not found"
}
```

- When token payload is invalid
```json
{
  "message": "Token payload invalid"
}
```

- When token is blacklisted
```json
{
  "message": "Token is blacklisted, authorization denied"
}
```

**Code:** 500 INTERNAL SERVER ERROR
```json
{
  "message": "Server error"
}
```

#### Security

- Requires a valid JWT token obtained from driver login or registration
- Token can be sent via Authorization header or cookie
- Token is validated and decoded to fetch the driver information
- Driver's existence is verified in the database for each request
- Token blacklist is checked to prevent use of logged-out tokens

#### Response Fields

| Field               | Type   | Description                                    |
|---------------------|--------|------------------------------------------------|
| _id                 | string | Driver's unique identifier                     |
| name.firstName      | string | Driver's first name                           |
| name.lastName       | string | Driver's last name (empty string if not set)  |
| email              | string | Driver's email address                         |
| socketId           | string | Socket ID for real-time communication         |
| vehicle.color      | string | Color of the driver's vehicle                 |
| vehicle.plate      | string | Vehicle's plate number                        |
| vehicle.capacity   | number | Vehicle's passenger capacity                  |
| vehicle.vehicleType| string | Type of vehicle (car/bike/auto)              |
| location.lat       | number | Current latitude coordinate                   |
| location.lng       | number | Current longitude coordinate                  |
| status             | string | Driver's current status (active/inactive)     |

#### Notes

- The endpoint is protected by the driver authentication middleware
- Password and sensitive information are excluded from the response
- Vehicle information is included for ride matching
- Location coordinates are included for tracking
- Status indicates driver's availability
- Socket ID is included for real-time communication features

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
