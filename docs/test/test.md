test id
"email":"day9test@example.com",
"password":"password123"

token: accessToken":eyJhbGciOiJIUzI1NiJ9eyJzdWIiOiJkYXk5dGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc4NDYwOTg4MywiZXhwIjoxNzg0NjEzNDgzfQNS60Xr6KDFfVIJEDGbBiuyLmVcgX0skTPGbvDOuBGvE


curl -X POST http://localhost:8080/api/carts/items \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9eyJzdWIiOiJkYXk5dGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc4NDYwOTg4MywiZXhwIjoxNzg0NjEzNDgzfQNS60Xr6KDFfVIJEDGbBiuyLmVcgX0skTPGbvDOuBGvE" \
-H "Content-Type: application/json" \
-d '{
  "menuItemId":1,
  "quantity":2
}'