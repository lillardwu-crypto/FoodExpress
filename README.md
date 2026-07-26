# 🍔 FoodExpress

A full-stack food delivery platform inspired by Uber Eats, built with Spring Boot, React, MySQL, JWT Authentication, and WebSocket.

FoodExpress provides a complete online food ordering workflow, including customer ordering, merchant order management, delivery tracking, and real-time order status updates.

---

## Tech Stack

### Backend

- Java 21
- Spring Boot 3
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- MySQL
- Maven

### Frontend (Coming Soon)

- React
- TypeScript
- Axios
- React Router
- Tailwind CSS

### Realtime

- WebSocket
- STOMP

### Map

- Leaflet
- OpenStreetMap
- OpenRouteService

---

# System Architecture

```text
                React Frontend
                       │
                       │ REST API
                       ▼
        Spring Boot Backend
        ├──────── Authentication
        ├──────── Restaurant
        ├──────── Menu
        ├──────── Cart
        ├──────── Checkout
        ├──────── Order
        ├──────── Merchant
        ├──────── Driver
        └──────── WebSocket

                       │
                Spring Data JPA
                       │
                       ▼
                    MySQL
```

---

# Features

## Customer

- Register
- Login (JWT)
- Browse restaurants
- Browse menu
- Add items to cart
- View shopping cart
- Manage delivery addresses
- Checkout
- View order history

---

## Merchant

- View restaurant orders
- Update order status
- Restaurant ownership validation
- JWT authorization
- Order state validation

---

## Driver (Coming Soon)

- View available orders
- Accept delivery orders
- Update delivery status
- Real-time delivery tracking

---

## Admin (Future)

- Restaurant management
- User management
- Statistics Dashboard

---

# Project Structure

```text
FoodExpress
│
├── backend
│   ├── config
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── exception
│   ├── repository
│   ├── security
│   ├── service
│   └── FoodExpressApplication
│
├── frontend
│
└── docs
```

---

# Database Design

Main entities:

```
User
Restaurant
MenuItem
Cart
CartItem
Order
OrderItem
Address
```

Relationships

```
User
│
├── Address
│
├── Cart
│
└── Order

Restaurant
│
├── MenuItem
│
└── Order

Order
│
└── OrderItem
```

---

# Authentication

FoodExpress uses JWT Authentication.

```
Login
    │
    ▼

Generate JWT

    │

Client stores Token

    │

Authorization Header

    │

Spring Security

    │

Authenticated User
```

---

# Order Workflow

```
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
```

---

# Merchant Workflow

```
Merchant Login

        │

View Restaurant Orders

        │

Accept Order

        │

Preparing

        │

Ready For Pickup
```

---

# Business Rules

## Shopping Cart

- One active cart per user
- One restaurant per cart
- Restaurant must be OPEN
- Menu item must be AVAILABLE

---

## Checkout

- Active cart cannot be empty
- Delivery address must belong to current user
- Order price is copied from menu item
- Shopping cart becomes inactive after checkout

---

## Merchant

Merchant can only access:

- Orders belonging to owned restaurant

Allowed transitions

```
PENDING

↓

ACCEPTED

↓

PREPARING

↓

READY_FOR_PICKUP
```

Invalid transition

```
409 Conflict
```

Unauthorized restaurant

```
404 Not Found
```

---

# REST APIs

## Authentication

```
POST /api/auth/register
POST /api/auth/login
```

---

## Restaurant

```
GET /api/restaurants
GET /api/restaurants/{id}
GET /api/restaurants/{id}/menu
```

---

## Cart

```
POST /api/carts/items
GET /api/carts
```

---

## Address

```
POST   /api/users/{id}/addresses
GET    /api/users/{id}/addresses
PUT    /api/users/{id}/addresses/{id}/default
DELETE /api/users/{id}/addresses/{id}
```

---

## Order

```
POST /api/orders
GET  /api/orders
```

---

## Merchant

```
GET   /api/merchant/orders
PATCH /api/merchant/orders/{id}/status
```

---

## Driver

Coming Soon

---

# Current Progress

## Completed

- JWT Authentication
- Spring Security
- Restaurant Module
- Menu Module
- Shopping Cart Module
- Address Module
- Checkout Module
- Order Module
- Merchant Module

---

## In Progress

- Driver Module
- React Frontend

---

## Planned

- WebSocket
- Live Delivery Tracking
- Map Integration
- Payment Simulation
- Notification System

---

# Future Improvements

- Redis Cache
- Docker
- CI/CD
- AWS Deployment
- Kubernetes
- Elasticsearch
- Recommendation System

---

# Screenshots

Coming Soon

---

# License

MIT License