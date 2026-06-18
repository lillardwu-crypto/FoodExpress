# FoodExpress System Architecture

## 1. 项目简介

FoodExpress 是一个参考 Uber Eats 设计的全栈外卖平台。

用户可以：

* 浏览餐厅
* 查看菜单
* 添加购物车
* 创建订单
* 查看订单状态

商家可以：

* 管理菜品
* 查看订单
* 更新订单状态

项目采用前后端分离架构。

---

# 2. 技术栈

## Frontend

```text
React
```

负责：

* 页面展示
* 用户交互
* API 调用

---

## Backend

```text
Java
Spring Boot
Spring Data JPA
```

负责：

* 业务逻辑
* API 服务
* 数据校验
* 数据持久化

---

## Database

```text
MySQL
```

负责：

* 用户数据
* 餐厅数据
* 菜单数据
* 订单数据

---

## Deployment

```text
Docker
Docker Compose
```

负责：

* 服务部署
* 环境统一
* 容器管理

---

# 3. 整体架构图

```text
+----------------------+
|      React UI        |
+----------------------+
           |
           |
           v
+----------------------+
| Spring Boot REST API |
+----------------------+
           |
           |
           v
+----------------------+
|        MySQL         |
+----------------------+
```

---

# 4. 后端分层架构

FoodExpress 后端采用经典三层架构。

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
MySQL
```

---

## Controller Layer

负责：

* 接收 HTTP 请求
* 参数校验
* 返回响应

示例：

```text
RestaurantController
CartController
OrderController
```

---

## Service Layer

负责：

* 核心业务逻辑
* 订单处理
* 状态流转

示例：

```text
OrderService
CartService
RestaurantService
```

---

## Repository Layer

负责：

* 数据库访问
* JPA 查询

示例：

```text
OrderRepository
UserRepository
MenuItemRepository
```

---

# 5. 用户下单流程

```text
用户浏览餐厅
        ↓
查看菜单
        ↓
加入购物车
        ↓
查看购物车
        ↓
创建订单
        ↓
生成 Order
        ↓
生成 OrderItem
        ↓
清空购物车
        ↓
返回订单详情
```

---

# 6. 订单状态流转

订单状态采用状态机设计。

```text
PENDING
    ↓
ACCEPTED
    ↓
PREPARING
    ↓
READY_FOR_PICKUP
    ↓
OUT_FOR_DELIVERY
    ↓
DELIVERED
```

取消订单：

```text
CANCELLED
```

---

# 7. 数据库架构

核心表：

```text
users
restaurants
menu_items

carts
cart_items

orders
order_items
```

关系：

```text
User
 ├── Cart
 └── Orders

Restaurant
 ├── MenuItems
 └── Orders

Order
 └── OrderItems
```

---

# 8. 订单快照设计

OrderItem 中保存：

```text
menu_item_name
price
quantity
```

而不是只保存：

```text
menu_item_id
```

原因：

菜单价格可能发生变化。

订单需要保存用户下单时的真实价格。

例如：

```text
下单时 Burger = $12.99

后来 Burger = $15.99
```

历史订单仍然应该显示：

```text
$12.99
```

这种设计称为：

```text
Order Snapshot
```

---

# 9. 项目扩展方向

未来可以增加：

## Authentication

```text
Spring Security
JWT
```

实现登录认证。

---

## Cache

```text
Redis
```

缓存热门餐厅和菜单。

---

## Search

```text
Elasticsearch
```

实现餐厅搜索。

---

## AI Recommendation

```text
Python
OpenAI API
Vector Database
```

实现：

* 个性化推荐
* 智能点餐建议
* 热门菜品分析

---

# 10. Docker 部署架构

未来部署架构：

```text
React Container
        |
        |
Spring Boot Container
        |
        |
MySQL Container
```

通过 Docker Compose 管理。

---

# 11. 项目亮点

1. 前后端分离架构
2. RESTful API 设计
3. JPA 数据持久化
4. 订单快照设计
5. 状态机订单流转
6. Docker 容器化部署
7. 可扩展 AI 推荐系统

```
```
