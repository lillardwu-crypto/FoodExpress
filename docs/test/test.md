test id
"email":"day9test@example.com",
"password":"password123"

curl -X POST http://localhost:8080/api/auth/login \

  -H "Content-Type: application/json" \

  -d '{

    "email": "day9test@example.com",

    "password": "password123"

  }'

  merchant@example.com
  driver@example.com


TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkYXk5dGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc4NDY3NTQ2MCwiZXhwIjoxNzg0Njc5MDYwfQ.DgxBzWcXp9mDwgqa__MK2Dhl2slJZHCIqnx3pYcZNN0"


curl -X POST http://localhost:8080/api/carts/items \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9eyJzdWIiOiJkYXk5dGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc4NDYwOTg4MywiZXhwIjoxNzg0NjEzNDgzfQNS60Xr6KDFfVIJEDGbBiuyLmVcgX0skTPGbvDOuBGvE" \
-H "Content-Type: application/json" \
-d '{
  "menuItemId":1,
  "quantity":2
}'