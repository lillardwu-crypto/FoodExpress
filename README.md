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

# System Architecture

> Architecture Diagram

*(Coming Soon)*

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

# Real-Time Order Tracking

FoodExpress uses Spring WebSocket (STOMP + SockJS) to provide real-time order tracking.

Whenever a merchant or driver updates an order status, subscribed customers immediately receive live updates without refreshing the page.

Real-time features include:

- Live Order Timeline
- Driver Delivery Animation
- Automatic Status Synchronization

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