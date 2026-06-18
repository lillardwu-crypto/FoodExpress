# FoodExpress API Design

## 1. API 设计目标

FoodExpress 采用前后端分离架构：

```text
React Frontend  →  Spring Boot REST API  →  MySQL Database
```

API 的主要目标是支持两个核心业务流程：

1. 用户点餐流程
   浏览餐厅 → 查看菜单 → 加入购物车 → 下单 → 查看订单

2. 商家管理流程
   管理菜品 → 查看订单 → 更新订单状态

所有 API 统一使用 `/api` 作为前缀。

---

## 2. RESTful 设计规范

### HTTP Method 规范

```text
GET     查询数据
POST    创建数据
PUT     更新完整资源
PATCH   更新部分字段
DELETE  删除资源
```

### Base URL

```http
/api
```

---

# 3. Restaurant API

## 3.1 获取餐厅列表

```http
GET /api/restaurants
```

用途：

用户进入首页时，获取所有可展示餐厅。

Response Example:

```json
[
  {
    "id": 1,
    "name": "Boston Burger",
    "address": "123 Main St, Boston, MA",
    "phone": "617-123-4567",
    "status": "OPEN"
  },
  {
    "id": 2,
    "name": "Sushi House",
    "address": "88 Harvard Ave, Boston, MA",
    "phone": "617-888-9999",
    "status": "OPEN"
  }
]
```

---

## 3.2 获取餐厅详情

```http
GET /api/restaurants/{restaurantId}
```

用途：

用户点击某个餐厅后，查看餐厅详情。

Response Example:

```json
{
  "id": 1,
  "name": "Boston Burger",
  "address": "123 Main St, Boston, MA",
  "phone": "617-123-4567",
  "status": "OPEN"
}
```

---

# 4. Menu Item API

## 4.1 获取某个餐厅的菜单

```http
GET /api/restaurants/{restaurantId}/menu-items
```

用途：

用户进入餐厅页面后，查看该餐厅所有可购买菜品。

Response Example:

```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "name": "Cheese Burger",
    "description": "Classic burger with cheese",
    "price": 12.99,
    "imageUrl": "https://example.com/burger.jpg",
    "available": true
  },
  {
    "id": 2,
    "restaurantId": 1,
    "name": "French Fries",
    "description": "Crispy fries",
    "price": 4.99,
    "imageUrl": "https://example.com/fries.jpg",
    "available": true
  }
]
```

---

# 5. Cart API

## 5.1 查看购物车

```http
GET /api/cart
```

用途：

用户查看当前购物车内容。

Response Example:

```json
{
  "cartId": 1,
  "userId": 1,
  "items": [
    {
      "cartItemId": 1,
      "menuItemId": 1,
      "name": "Cheese Burger",
      "price": 12.99,
      "quantity": 2,
      "subtotal": 25.98
    }
  ],
  "totalPrice": 25.98
}
```

---

## 5.2 添加商品到购物车

```http
POST /api/cart/items
```

用途：

用户点击“加入购物车”。

Request Example:

```json
{
  "menuItemId": 1,
  "quantity": 2
}
```

Response Example:

```json
{
  "message": "Item added to cart successfully"
}
```

---

## 5.3 修改购物车商品数量

```http
PUT /api/cart/items/{cartItemId}
```

用途：

用户修改购物车中某个商品的数量。

Request Example:

```json
{
  "quantity": 3
}
```

Response Example:

```json
{
  "message": "Cart item updated successfully"
}
```

---

## 5.4 删除购物车商品

```http
DELETE /api/cart/items/{cartItemId}
```

用途：

用户从购物车中删除某个商品。

Response Example:

```json
{
  "message": "Cart item removed successfully"
}
```

---

# 6. Order API

## 6.1 创建订单

```http
POST /api/orders
```

用途：

用户从购物车创建订单。

Request Example:

```json
{
  "restaurantId": 1
}
```

Response Example:

```json
{
  "orderId": 1001,
  "status": "PENDING",
  "totalPrice": 25.98,
  "message": "Order created successfully"
}
```

设计说明：

创建订单时，系统会从购物车中读取商品，并在 `order_items` 表中保存商品名称和价格快照。

---

## 6.2 查看当前用户所有订单

```http
GET /api/orders
```

用途：

用户查看自己的历史订单。

Response Example:

```json
[
  {
    "orderId": 1001,
    "restaurantName": "Boston Burger",
    "status": "PENDING",
    "totalPrice": 25.98,
    "createdAt": "2026-06-18T12:30:00"
  }
]
```

---

## 6.3 查看订单详情

```http
GET /api/orders/{orderId}
```

用途：

用户查看某个订单的详细内容。

Response Example:

```json
{
  "orderId": 1001,
  "restaurantName": "Boston Burger",
  "status": "PENDING",
  "totalPrice": 25.98,
  "items": [
    {
      "menuItemName": "Cheese Burger",
      "price": 12.99,
      "quantity": 2,
      "subtotal": 25.98
    }
  ],
  "createdAt": "2026-06-18T12:30:00"
}
```

---

# 7. Merchant API

## 7.1 商家新增菜品

```http
POST /api/merchant/restaurants/{restaurantId}/menu-items
```

用途：

商家为自己的餐厅新增菜品。

Request Example:

```json
{
  "name": "Chicken Sandwich",
  "description": "Grilled chicken sandwich",
  "price": 10.99,
  "imageUrl": "https://example.com/chicken.jpg",
  "available": true
}
```

Response Example:

```json
{
  "id": 3,
  "message": "Menu item created successfully"
}
```

---

## 7.2 商家修改菜品

```http
PUT /api/merchant/menu-items/{menuItemId}
```

用途：

商家修改某个菜品的信息。

Request Example:

```json
{
  "name": "Double Cheese Burger",
  "description": "Burger with double cheese",
  "price": 15.99,
  "imageUrl": "https://example.com/double-burger.jpg",
  "available": true
}
```

Response Example:

```json
{
  "message": "Menu item updated successfully"
}
```

---

## 7.3 商家删除菜品

```http
DELETE /api/merchant/menu-items/{menuItemId}
```

用途：

商家删除某个菜品。

Response Example:

```json
{
  "message": "Menu item deleted successfully"
}
```

---

## 7.4 商家更新订单状态

```http
PATCH /api/merchant/orders/{orderId}/status
```

用途：

商家处理订单状态流转。

Request Example:

```json
{
  "status": "PREPARING"
}
```

Response Example:

```json
{
  "orderId": 1001,
  "status": "PREPARING",
  "message": "Order status updated successfully"
}
```

订单状态流转：

```text
PENDING
→ ACCEPTED
→ PREPARING
→ READY_FOR_PICKUP
→ OUT_FOR_DELIVERY
→ DELIVERED
```

取消状态：

```text
CANCELLED
```

---

# 8. 错误响应格式

所有错误统一返回：

```json
{
  "timestamp": "2026-06-18T12:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Restaurant not found",
  "path": "/api/restaurants/999"
}
```

常见 HTTP 状态码：

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

---

# 9. API 与数据库表关系

```text
GET /api/restaurants
→ restaurants

GET /api/restaurants/{restaurantId}/menu-items
→ menu_items

GET /api/cart
→ carts, cart_items, menu_items

POST /api/cart/items
→ carts, cart_items

POST /api/orders
→ orders, order_items, carts, cart_items

GET /api/orders
→ orders, restaurants

GET /api/orders/{orderId}
→ orders, order_items, restaurants

POST /api/merchant/restaurants/{restaurantId}/menu-items
→ menu_items

PATCH /api/merchant/orders/{orderId}/status
→ orders
```

---

# 10. 面试讲法

本项目的 API 不是简单按照数据库表暴露 CRUD，而是按照真实业务流程设计。

用户端 API 主要围绕：

```text
浏览餐厅
查看菜单
购物车
下单
查看订单
```

商家端 API 主要围绕：

```text
菜单管理
订单状态更新
```

订单创建接口是核心接口，因为它涉及：

```text
购物车读取
订单创建
订单项快照
总价计算
购物车清空
```

这也是后端业务逻辑最重要的部分。
