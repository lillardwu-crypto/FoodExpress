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