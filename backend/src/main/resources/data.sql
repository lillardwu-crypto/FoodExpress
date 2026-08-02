-- =========================================================
-- FoodExpress Demo Data
--
-- Demo account password:
-- password123
--
-- This script is idempotent:
-- existing demo records will not be inserted repeatedly.
-- =========================================================


-- =========================================================
-- 1. Demo Users
-- =========================================================

-- BCrypt hash for: password123
-- The same demo password is used for all three roles.

INSERT INTO users (
    name,
    email,
    password,
    role,
    enabled,
    created_at,
    updated_at
)
SELECT
    'Demo Customer',
    'day9test@example.com',
    '$2a$10$RXw67k5PrgLZiejw3SQstOpj6joEtM0YMh7ZxGiCyyiFtWA3xWraa',
    'CUSTOMER',
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE email = 'day9test@example.com'
);


INSERT INTO users (
    name,
    email,
    password,
    role,
    enabled,
    created_at,
    updated_at
)
SELECT
    'Demo Merchant',
    'merchant@example.com',
    '$2a$10$RXw67k5PrgLZiejw3SQstOpj6joEtM0YMh7ZxGiCyyiFtWA3xWraa',
    'MERCHANT',
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE email = 'merchant@example.com'
);


INSERT INTO users (
    name,
    email,
    password,
    role,
    enabled,
    created_at,
    updated_at
)
SELECT
    'Demo Driver',
    'driver@example.com',
    '$2a$10$RXw67k5PrgLZiejw3SQstOpj6joEtM0YMh7ZxGiCyyiFtWA3xWraa',
    'DRIVER',
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE email = 'driver@example.com'
);


-- =========================================================
-- 2. Customer Default Address
-- =========================================================

INSERT INTO addresses (
    user_id,
    label,
    recipient_name,
    phone,
    street,
    city,
    state,
    zip_code,
    is_default,
    created_at,
    updated_at
)
SELECT
    customer.id,
    'Home',
    'Demo Customer',
    '6171234567',
    '999 Test Street',
    'Brighton',
    'MA',
    '02135',
    TRUE,
    NOW(),
    NOW()
FROM users customer
WHERE customer.email = 'day9test@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM addresses address
      WHERE address.user_id = customer.id
        AND address.label = 'Home'
  );


-- =========================================================
-- 3. Demo Restaurants
-- =========================================================

INSERT INTO restaurants (
    name,
    address,
    phone,
    image_url,
    rating,
    category,
    delivery_time,
    delivery_fee,
    status,
    latitude,
    longitude,
    owner_id,
    created_at,
    updated_at
)
SELECT
    'Boston Burger',
    '123 Main St, Boston, MA',
    '617-123-4567',
    'burger.jpg',
    4.8,
    'Burger',
    25,
    2.99,
    'OPEN',
    42.3505000,
    -71.1054000,
    merchant.id,
    NOW(),
    NOW()
FROM users merchant
WHERE merchant.email = 'merchant@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM restaurants restaurant
      WHERE restaurant.name = 'Boston Burger'
  );


INSERT INTO restaurants (
    name,
    address,
    phone,
    image_url,
    rating,
    category,
    delivery_time,
    delivery_fee,
    status,
    latitude,
    longitude,
    owner_id,
    created_at,
    updated_at
)
SELECT
    'Boston Pizza',
    '500 Commonwealth Ave, Boston, MA',
    '617-555-0200',
    'pizza.jpg',
    4.6,
    'Pizza',
    30,
    1.99,
    'OPEN',
    42.3489000,
    -71.0958000,
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM restaurants restaurant
    WHERE restaurant.name = 'Boston Pizza'
);


-- =========================================================
-- 4. Boston Burger Menu
-- =========================================================

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    image_url,
    available,
    created_at,
    updated_at
)
SELECT
    restaurant.id,
    'Cheese Burger',
    'Beef patty with American cheese, lettuce, tomato, and house sauce.',
    12.99,
    NULL,
    TRUE,
    NOW(),
    NOW()
FROM restaurants restaurant
WHERE restaurant.name = 'Boston Burger'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items item
      WHERE item.restaurant_id = restaurant.id
        AND item.name = 'Cheese Burger'
  );


INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    image_url,
    available,
    created_at,
    updated_at
)
SELECT
    restaurant.id,
    'Double Burger',
    'Two beef patties with cheese, onions, pickles, and house sauce.',
    15.99,
    NULL,
    TRUE,
    NOW(),
    NOW()
FROM restaurants restaurant
WHERE restaurant.name = 'Boston Burger'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items item
      WHERE item.restaurant_id = restaurant.id
        AND item.name = 'Double Burger'
  );


INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    image_url,
    available,
    created_at,
    updated_at
)
SELECT
    restaurant.id,
    'Crispy Chicken Burger',
    'Crispy chicken breast with lettuce, pickles, and spicy mayonnaise.',
    13.49,
    NULL,
    TRUE,
    NOW(),
    NOW()
FROM restaurants restaurant
WHERE restaurant.name = 'Boston Burger'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items item
      WHERE item.restaurant_id = restaurant.id
        AND item.name = 'Crispy Chicken Burger'
  );


INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    image_url,
    available,
    created_at,
    updated_at
)
SELECT
    restaurant.id,
    'French Fries',
    'Crispy golden fries seasoned with sea salt.',
    4.49,
    NULL,
    TRUE,
    NOW(),
    NOW()
FROM restaurants restaurant
WHERE restaurant.name = 'Boston Burger'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items item
      WHERE item.restaurant_id = restaurant.id
        AND item.name = 'French Fries'
  );


-- =========================================================
-- 5. Boston Pizza Menu
-- =========================================================

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    image_url,
    available,
    created_at,
    updated_at
)
SELECT
    restaurant.id,
    'Margherita Pizza',
    'Tomato sauce, fresh mozzarella, basil, and olive oil.',
    14.99,
    NULL,
    TRUE,
    NOW(),
    NOW()
FROM restaurants restaurant
WHERE restaurant.name = 'Boston Pizza'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items item
      WHERE item.restaurant_id = restaurant.id
        AND item.name = 'Margherita Pizza'
  );


INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    image_url,
    available,
    created_at,
    updated_at
)
SELECT
    restaurant.id,
    'Pepperoni Pizza',
    'Classic pepperoni pizza with mozzarella and tomato sauce.',
    16.99,
    NULL,
    TRUE,
    NOW(),
    NOW()
FROM restaurants restaurant
WHERE restaurant.name = 'Boston Pizza'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items item
      WHERE item.restaurant_id = restaurant.id
        AND item.name = 'Pepperoni Pizza'
  );


INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    image_url,
    available,
    created_at,
    updated_at
)
SELECT
    restaurant.id,
    'BBQ Chicken Pizza',
    'Grilled chicken, barbecue sauce, red onion, and mozzarella.',
    18.49,
    NULL,
    TRUE,
    NOW(),
    NOW()
FROM restaurants restaurant
WHERE restaurant.name = 'Boston Pizza'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items item
      WHERE item.restaurant_id = restaurant.id
        AND item.name = 'BBQ Chicken Pizza'
  );


INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    image_url,
    available,
    created_at,
    updated_at
)
SELECT
    restaurant.id,
    'Garlic Bread',
    'Oven-baked garlic bread served with marinara sauce.',
    6.49,
    NULL,
    TRUE,
    NOW(),
    NOW()
FROM restaurants restaurant
WHERE restaurant.name = 'Boston Pizza'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items item
      WHERE item.restaurant_id = restaurant.id
        AND item.name = 'Garlic Bread'
  );