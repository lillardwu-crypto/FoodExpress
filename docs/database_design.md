# FoodExpress Database Design

## 1. Core Entities

FoodExpress is a food delivery platform with three main business flows:

1. Users browse restaurants and menu items.
2. Users add menu items to cart.
3. Users place orders and track order status.

The initial database contains 7 core tables:

- users
- restaurants
- menu_items
- carts
- cart_items
- orders
- order_items

---

## 2. Entity Relationship Overview

```text
User 1 ─── 1 Cart

Cart 1 ─── N CartItem

Restaurant 1 ─── N MenuItem

User 1 ─── N Order

Restaurant 1 ─── N Order

Order 1 ─── N OrderItem



------------
3. Tables
3.1 users

Stores platform users.

id          BIGINT PRIMARY KEY
name        VARCHAR(100)
email       VARCHAR(100) UNIQUE
password    VARCHAR(255)
role        VARCHAR(50)
created_at  DATETIME
updated_at  DATETIME

example roles: CUSTOMER,MERCHANT,ADMIN


3.2 restaurants

Stores restaurant information.

id          BIGINT PRIMARY KEY
name        VARCHAR(100)
address     VARCHAR(255)
phone       VARCHAR(50)
status      VARCHAR(50)
created_at  DATETIME
updated_at  DATETIME

Example status: OPEN, CLOSED, INACTIVE

3.3 menu_items

Stores menu items that belong to a restaurant.

id              BIGINT PRIMARY KEY
restaurant_id   BIGINT FOREIGN KEY
name            VARCHAR(100)
description     TEXT
price           DECIMAL(10, 2)
image_url       VARCHAR(255)
available       BOOLEAN
created_at      DATETIME
updated_at      DATETIME

Relationships: Restaurant 1 ─── N MenuItem


3.4 carts

Stores each user's active shopping cart.

id          BIGINT PRIMARY KEY
user_id     BIGINT FOREIGN KEY UNIQUE
created_at  DATETIME
updated_at  DATETIME

Examples: User 1 ─── 1 Cart  --- Each user only has one active cart.


3.5 cart_items

Stores menu items inside a cart.

id            BIGINT PRIMARY KEY
cart_id       BIGINT FOREIGN KEY
menu_item_id  BIGINT FOREIGN KEY
quantity      INT
created_at    DATETIME
updated_at    DATETIME


Relationship:

Cart 1 ─── N CartItem
MenuItem 1 ─── N CartItem

Design note:

The cart does not store price snapshots because prices can still change before checkout.

3.6 orders

Stores placed orders.

id              BIGINT PRIMARY KEY
user_id         BIGINT FOREIGN KEY
restaurant_id   BIGINT FOREIGN KEY
status          VARCHAR(50)
total_price     DECIMAL(10, 2)
created_at      DATETIME
updated_at      DATETIME

Relationship: User 1 ─── N Order, Restaurant 1 ─── N Order

Example order status:
PENDING
ACCEPTED
PREPARING
READY_FOR_PICKUP
OUT_FOR_DELIVERY
DELIVERED
CANCELLED

3.7 order_items

Stores items inside a placed order.

id               BIGINT PRIMARY KEY
order_id         BIGINT FOREIGN KEY
menu_item_id     BIGINT
menu_item_name   VARCHAR(100)
price            DECIMAL(10, 2)
quantity         INT
created_at       DATETIME

Relationship:

Order 1 ─── N OrderItem

Important design note:

order_items stores menu_item_name and price as an order snapshot.

This means even if the restaurant changes the menu item name or price later, historical orders remain unchanged.

Example:

Burger price when ordered: $12.99
Burger price after update: $15.99

Historical order should still show: $12.99

This is why order_items should not only rely on menu_item_id.



4. Key Design Decisions
4.1 Why separate CartItem and OrderItem?

CartItem represents temporary user intent before checkout.

OrderItem represents confirmed purchase history after checkout.

CartItem can change.

OrderItem should not change.

4.2 Why store price in order_items?

Because orders require historical consistency.

Menu prices may change, but completed orders should preserve the exact price at checkout time.

4.3 Why use status fields?

Status fields allow the system to model real business workflows.

Examples:

Restaurant status:

OPEN → CLOSED

Order status:

PENDING → ACCEPTED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
4.4 Why use foreign keys?

Foreign keys maintain data integrity.

Examples:

A menu item must belong to a restaurant.

An order must belong to a user.

An order item must belong to an order.



Examples:
users
  |
  | 1
  |
  | 1
carts
  |
  | 1
  |
  | N
cart_items
  |
  | N
  |
  | 1
menu_items
  |
  | N
  |
  | 1
restaurants


users
  |
  | 1
  |
  | N
orders
  |
  | 1
  |
  | N
order_items

restaurants
  |
  | 1
  |
  | N
orders




6. Future Improvements (After 2026.6.18)

Future database extensions may include:

payments
delivery_drivers
addresses
reviews
coupons
restaurant_categories
user_favorites
search_index
AI recommendation logs