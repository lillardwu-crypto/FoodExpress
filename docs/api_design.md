FoodExpress Backend API Design

Project: FoodExpress (Uber Eats Clone)

Version: v1.0

Authentication: JWT Bearer Token

Base URL

http://localhost:8080/api
Authentication

Most APIs require JWT authentication.

Request Header

Authorization: Bearer <JWT_TOKEN>
Authentication APIs
Register

Create a new customer account.

Endpoint
POST /auth/register
Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
Response
{
  "id": 3,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
Login

Authenticate user and return JWT.

Endpoint
POST /auth/login
Request
{
  "email": "john@example.com",
  "password": "123456"
}
Response
{
  "token": "eyJhbGc..."
}
Restaurant APIs
Get All Restaurants
Endpoint
GET /restaurants
Response
[
  {
    "id": 1,
    "name": "Boston Burger",
    "status": "OPEN"
  }
]
Get Restaurant By ID
Endpoint
GET /restaurants/{id}
Menu APIs
Get Restaurant Menu
Endpoint
GET /restaurants/{restaurantId}/menu
Response
[
  {
    "id": 1,
    "name": "Cheese Burger",
    "price": 12.99,
    "available": true
  }
]
Cart APIs

Authentication Required

Add Item to Cart
Endpoint
POST /carts/items
Request
{
    "menuItemId":1,
    "quantity":2
}
Response
{
    "cartId":2,
    "userId":3,
    "restaurantId":1,
    "totalPrice":25.98,
    "items":[]
}
Get Active Cart
Endpoint
GET /carts
Response
{
    "cartId":2,
    "restaurantId":1,
    "totalPrice":25.98,
    "items":[]
}
Address APIs

Authentication Required

Create Address
Endpoint
POST /users/{userId}/addresses
Request
{
    "label":"Home",
    "recipientName":"John",
    "phone":"123456789",
    "street":"123 Main Street",
    "city":"Boston",
    "state":"MA",
    "zipCode":"02115"
}
Get User Addresses
Endpoint
GET /users/{userId}/addresses
Delete Address
Endpoint
DELETE /users/{userId}/addresses/{addressId}
Set Default Address
Endpoint
PUT /users/{userId}/addresses/{addressId}/default
Checkout API

Authentication Required

Checkout

Create a new order from active cart.

Endpoint
POST /orders
Request
{
    "addressId":4
}
Response
{
    "orderId":7,
    "status":"PENDING",
    "totalPrice":51.96
}
Customer Order APIs

Authentication Required

Get Current User Orders
Endpoint
GET /orders
Response
[
    {
        "orderId":7,
        "status":"PENDING",
        "restaurantId":1,
        "totalPrice":51.96
    }
]
Merchant APIs

Authentication Required

Role: MERCHANT

Get Merchant Orders

Retrieve all orders belonging to the authenticated merchant.

Endpoint
GET /merchant/orders
Response
[
    {
        "orderId":7,
        "status":"READY_FOR_PICKUP",
        "restaurantId":1,
        "totalPrice":51.96
    }
]
Update Order Status

Merchant updates an order status.

Endpoint
PATCH /merchant/orders/{orderId}/status
Request
{
    "status":"PREPARING"
}
Response
{
    "orderId":7,
    "status":"PREPARING"
}
Business Rules
Cart
One active cart per user
One restaurant per cart
Menu item must be available
Restaurant must be OPEN
Checkout
Cart cannot be empty
Address must belong to current user
Order copies menu price into OrderItem
Cart becomes inactive after checkout
Merchant

Merchant can only access:

Orders belonging to owned restaurant

Merchant allowed transitions:

PENDING
↓

ACCEPTED
↓

PREPARING
↓

READY_FOR_PICKUP

Invalid transition

409 Conflict

Accessing another merchant's order

404 Not Found
Authentication & Authorization
Role	Permission
CUSTOMER	Browse restaurant, cart, checkout, view own orders
MERCHANT	View own restaurant orders, update order status
DRIVER	(Coming Soon)
ADMIN	(Coming Soon)
Order State Machine
Customer

PENDING
    │
    ▼

Merchant

ACCEPTED
    │
    ▼

PREPARING
    │
    ▼

READY_FOR_PICKUP
    │
    ▼

Driver

OUT_FOR_DELIVERY
    │
    ▼

DELIVERED