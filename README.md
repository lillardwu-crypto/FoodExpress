# 🍔 FoodExpress

A production-style full-stack food delivery platform inspired by Uber Eats.

FoodExpress provides a complete end-to-end food ordering experience, including customer ordering, merchant order management, driver delivery workflow, real-time order tracking, and live delivery visualization.

Built with Java 21, Spring Boot, React, MySQL, WebSocket, and Docker.

## 📐 System Architecture

<p align="center">
  <img src="docs/architecture.png" alt="FoodExpress Architecture" width="100%">
</p>
---

# Overview

FoodExpress is a production-oriented food delivery platform designed to demonstrate modern full-stack software engineering practices.

Unlike a traditional CRUD application, FoodExpress models a real-world food delivery ecosystem with three independent roles:

- Customer
- Merchant
- Driver

The platform implements the complete delivery lifecycle from browsing restaurants to live order tracking.

Key engineering highlights include:

- Layered Backend Architecture
- JWT Authentication
- Role-Based Authorization
- RESTful API Design
- WebSocket Real-Time Communication
- Interactive Delivery Tracking
- Dockerized Deployment
- Production-Oriented Project Structure

---

# Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | day9test@example.com | password123 |
| Merchant | merchant@example.com | password123 |
| Driver | driver@example.com | password123 |

---

# Features

## Customer

- Secure JWT Authentication
- Browse Restaurants
- Restaurant Detail Page
- Browse Menu Items
- Shopping Cart
- Address Management
- Checkout
- Order History
- Order Details
- Live Order Timeline
- Real-Time Order Tracking
- Delivery Map Animation

---

## Merchant

- Merchant Authentication
- View Incoming Orders
- Accept Orders
- Update Order Status
- Real-Time Customer Notifications

---

## Driver

- View Available Orders
- Accept Delivery Orders
- Update Delivery Status
- Live Delivery Tracking

---

## System

- RESTful APIs
- JWT Authentication
- Role-Based Authorization
- Global Exception Handling
- WebSocket Notifications
- Docker Deployment

---

# Tech Stack

## Backend

- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- MySQL
- WebSocket (STOMP + SockJS)
- Maven

---

## Frontend

- React
- React Router
- Axios
- Leaflet
- CSS3

---

## DevOps

- Docker
- Docker Compose
- Nginx

---

## Tools

- Git
- GitHub
- IntelliJ IDEA
- VS Code
- Postman

---

# 🔐 JWT Authentication

FoodExpress secures all protected APIs using **Spring Security** and **JSON Web Tokens (JWT)**.

After successful authentication, the backend generates a signed JWT containing the user's identity and role. The client stores the token and automatically attaches it to subsequent API requests using the `Authorization: Bearer <token>` header.

Incoming requests are intercepted by the JWT authentication filter, where the token is validated before access is granted to protected resources.

<p align="center">
    <img src="docs/jwt-authentication-flow.png"
         alt="JWT Authentication Flow"
         width="100%">
</p>

### Authentication Process

1. User submits login credentials.
2. Spring Security authenticates the request.
3. A signed JWT is generated.
4. The client stores the token.
5. Every protected request includes the JWT.
6. The backend validates the token.
7. Access is granted based on the user's role.

### Security Features

- Spring Security
- JWT Authentication
- BCrypt Password Hashing
- Role-Based Authorization
- Stateless Authentication
- Authentication Filter

---

# Project Structure

```text
FoodExpress
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── config
│   ├── security
│   └── resources
│
├── frontend
│   ├── api
│   ├── components
│   ├── pages
│   ├── services
│   ├── hooks
│   └── styles
│
└── docker-compose.yml
```

---

# REST API

## Authentication

```
POST /api/auth/register
POST /api/auth/login
```

---

## Restaurants

```
GET /api/restaurants
GET /api/restaurants/{id}
```

---

## Cart

```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/{id}
DELETE /api/cart/items/{id}
```

---

## Address

```
GET    /api/addresses
POST   /api/addresses
PUT    /api/addresses/{id}
DELETE /api/addresses/{id}
PUT    /api/addresses/{id}/default
```

---

## Orders

```
POST /api/orders
GET  /api/orders/history
GET  /api/orders/{id}
```

---

## Merchant

```
GET /api/merchant/orders
PUT /api/merchant/orders/{id}/status
```

---

## Driver

```
GET /api/driver/orders
PUT /api/driver/orders/{id}/accept
PUT /api/driver/orders/{id}/status
```

---

# Database Design

FoodExpress uses a relational database designed around the core business entities, including users, restaurants, orders, carts, and addresses. The schema follows normalized relationships to support role-based operations, order management, and delivery tracking.

<p align="center">
  <img src="docs/er-diagram.png" width="100%">
</p>

Main Entities

- Users
- Restaurants
- MenuItems
- Cart
- CartItems
- Orders
- OrderItems
- Addresses

> ER Diagram

*(Coming Soon)*

---

# Order Workflow

The following diagram illustrates the complete order lifecycle from customer checkout to successful delivery.

<p align="center">
  <img src="docs/order-workflow.png" width="100%">
</p>

```
PENDING
      │
      ▼
PREPARING
      │
      ▼
READY_FOR_PICKUP
      │
      ▼
OUT_FOR_DELIVERY
      │
      ▼
DELIVERED
```

---

# 📡 Real-Time Order Tracking

FoodExpress uses **Spring WebSocket (STOMP over SockJS)** to provide real-time order status synchronization between customers, merchants, and drivers.

Whenever a merchant or driver updates an order status through the REST API, the backend persists the change, publishes a WebSocket event, and broadcasts the update to subscribed clients. React automatically refreshes the Order Timeline and Delivery Tracking components without requiring a page reload.

<p align="center">
    <img src="docs/websocket-architecture.png"
         alt="WebSocket Real-Time Architecture"
         width="100%">
</p>

### WebSocket Topics

| Topic | Description |
|-------|-------------|
| `/topic/orders/{orderId}` | Customer subscribes to a specific order |
| `/topic/merchant/orders` | Merchant receives restaurant order updates |
| `/topic/driver/orders/assigned` | Driver receives assigned deliveries |

### Technology

- Spring WebSocket
- STOMP Protocol
- SockJS
- SimpMessagingTemplate
- Topic-based Publish / Subscribe
- Automatic React UI Updates

---

# Docker Deployment

Run the complete application with Docker Compose.

```bash
docker compose up --build
```

Services

- MySQL
- Spring Boot Backend
- React Frontend
- Nginx Reverse Proxy

---

# Local Development

## Backend

```bash
cd backend

mvn spring-boot:run
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Future Improvements

- Stripe Payment Integration
- Email Notifications
- Push Notifications
- Admin Dashboard
- Restaurant Analytics
- Route Optimization
- Kubernetes Deployment
- GitHub Actions CI/CD
- Cloud Deployment (AWS)

---

# Screenshots

- Login
- Home Page
- Restaurant Details
- Shopping Cart
- Checkout
- Order History
- Order Timeline
- Merchant Dashboard
- Driver Dashboard
- Delivery Tracking Map

*(Screenshots Coming Soon)*

---

# Highlights

- Production-style layered architecture
- Secure JWT authentication
- Role-based authorization
- RESTful API design
- Real-time WebSocket communication
- Interactive delivery tracking
- Dockerized deployment
- Clean project structure
- Maintainable and scalable codebase

---

# License

MIT License