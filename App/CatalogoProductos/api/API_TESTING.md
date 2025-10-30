# API Testing Guide

This document provides examples for testing the Catalogo KDN API endpoints using `curl` and other HTTP clients.

## Base URL

```
http://localhost:3000
```

## Table of Contents

- [Health Check](#health-check)
- [Productos Endpoints](#productos-endpoints)
- [Pedidos Endpoints](#pedidos-endpoints)

---

## Health Check

### Check API Health

```bash
curl http://localhost:3000/api/health
```

### Get API Info

```bash
curl http://localhost:3000/api
```

---

## Productos Endpoints

### 1. Get All Productos

```bash
curl http://localhost:3000/api/productos
```

### 2. Get Productos with Pagination

```bash
curl "http://localhost:3000/api/productos?page=1&limit=10"
```

### 3. Get Productos with Filters

```bash
# Filter by name
curl "http://localhost:3000/api/productos?nombre=arroz"

# Filter by price range
curl "http://localhost:3000/api/productos?precioMin=50&precioMax=200"

# Order by price (ascending)
curl "http://localhost:3000/api/productos?orderBy=precio&orderDirection=asc"

# Order by price (descending)
curl "http://localhost:3000/api/productos?orderBy=precio&orderDirection=desc"

# Combined filters
curl "http://localhost:3000/api/productos?nombre=arroz&precioMin=50&precioMax=200&page=1&limit=5"
```

### 4. Get Producto by ID

```bash
curl http://localhost:3000/api/productos/1
```

### 5. Search Productos by Name

```bash
curl http://localhost:3000/api/productos/search/arroz
```

### 6. Get Latest Productos

```bash
# Get latest 10 productos
curl http://localhost:3000/api/productos/latest/10

# Get latest 5 productos
curl http://localhost:3000/api/productos/latest/5
```

### 7. Get Productos Ordered by Price

```bash
# Ascending order
curl http://localhost:3000/api/productos/order-by-precio/asc

# Descending order
curl http://localhost:3000/api/productos/order-by-precio/desc
```

### 8. Create a New Producto

```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Arroz Integral 1kg",
    "precio": 150.50,
    "peso": "1kg",
    "img_url": "https://example.com/arroz.jpg",
    "descripcion": "Arroz integral de alta calidad"
  }'
```

### 9. Update a Producto

```bash
curl -X PUT http://localhost:3000/api/productos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Arroz Integral 1kg - Actualizado",
    "precio": 160.00
  }'
```

### 10. Delete a Producto

```bash
curl -X DELETE http://localhost:3000/api/productos/1
```

---

## Pedidos Endpoints

### 1. Get All Pedidos

```bash
curl http://localhost:3000/api/pedidos
```

### 2. Get Pedidos with Pagination

```bash
curl "http://localhost:3000/api/pedidos?page=1&limit=10"
```

### 3. Get Pedidos with Filters

```bash
# Filter by comercio name
curl "http://localhost:3000/api/pedidos?nombre_comercio=almacen"

# Filter by email
curl "http://localhost:3000/api/pedidos?email=comercio@example.com"

# Filter by localidad
curl "http://localhost:3000/api/pedidos?localidad=buenos%20aires"

# Filter by date range
curl "http://localhost:3000/api/pedidos?fechaInicio=2024-01-01&fechaFin=2024-12-31"

# Order by date (descending - most recent first)
curl "http://localhost:3000/api/pedidos?orderBy=created_at&orderDirection=desc"

# Combined filters
curl "http://localhost:3000/api/pedidos?localidad=cordoba&fechaInicio=2024-01-01&page=1&limit=5"
```

### 4. Get Pedido by ID

```bash
curl http://localhost:3000/api/pedidos/1
```

### 5. Search Pedidos by Comercio

```bash
curl http://localhost:3000/api/pedidos/search/comercio/almacen
```

### 6. Search Pedidos by Email

```bash
curl http://localhost:3000/api/pedidos/search/email/comercio@example.com
```

### 7. Search Pedidos by Localidad

```bash
curl http://localhost:3000/api/pedidos/search/localidad/cordoba
```

### 8. Get Latest Pedidos

```bash
# Get latest 10 pedidos
curl http://localhost:3000/api/pedidos/latest/10

# Get latest 20 pedidos
curl http://localhost:3000/api/pedidos/latest/20
```

### 9. Get Pedidos by Date Range

```bash
curl "http://localhost:3000/api/pedidos/date-range?fechaInicio=2024-01-01T00:00:00Z&fechaFin=2024-12-31T23:59:59Z"
```

### 10. Get Pedidos Containing a Specific Product

```bash
curl http://localhost:3000/api/pedidos/producto/1
```

### 11. Create a New Pedido

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_comercio": "Almacén Don Pedro",
    "telefóno": "+54 351 123-4567",
    "email": "donpedro@example.com",
    "localidad": "Córdoba",
    "productos": [
      {
        "id": 1,
        "nombre": "Arroz Integral 1kg",
        "precio": 150.50,
        "quantity": 5,
        "peso": "1kg",
        "img_url": "https://example.com/arroz.jpg"
      },
      {
        "id": 2,
        "nombre": "Aceite de Oliva 500ml",
        "precio": 350.00,
        "quantity": 3,
        "peso": "500ml",
        "img_url": "https://example.com/aceite.jpg"
      }
    ]
  }'
```

### 12. Update a Pedido

```bash
curl -X PUT http://localhost:3000/api/pedidos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_comercio": "Almacén Don Pedro - Actualizado",
    "telefóno": "+54 351 987-6543"
  }'
```

### 13. Delete a Pedido

```bash
curl -X DELETE http://localhost:3000/api/pedidos/1
```

---

## Using with HTTPie (Alternative)

If you prefer using HTTPie instead of curl:

### Install HTTPie

```bash
# macOS
brew install httpie

# Linux
pip install httpie

# Windows
pip install httpie
```

### Example Requests

```bash
# GET request
http GET http://localhost:3000/api/productos

# POST request
http POST http://localhost:3000/api/productos \
  nombre="Arroz Integral" \
  precio:=150.50 \
  peso="1kg"

# PUT request
http PUT http://localhost:3000/api/productos/1 \
  precio:=160.00

# DELETE request
http DELETE http://localhost:3000/api/productos/1
```

---

## Using Postman

1. Import the following as a collection
2. Set base URL as variable: `{{baseUrl}} = http://localhost:3000`

### Example Collection Structure

```
Catalogo KDN API
├── Health Check
│   ├── GET /api/health
│   └── GET /api
├── Productos
│   ├── GET /api/productos
│   ├── GET /api/productos/:id
│   ├── POST /api/productos
│   ├── PUT /api/productos/:id
│   ├── DELETE /api/productos/:id
│   ├── GET /api/productos/search/:nombre
│   ├── GET /api/productos/latest/:limit
│   └── GET /api/productos/order-by-precio/:direction
└── Pedidos
    ├── GET /api/pedidos
    ├── GET /api/pedidos/:id
    ├── POST /api/pedidos
    ├── PUT /api/pedidos/:id
    ├── DELETE /api/pedidos/:id
    ├── GET /api/pedidos/search/comercio/:nombre
    ├── GET /api/pedidos/search/email/:email
    ├── GET /api/pedidos/search/localidad/:localidad
    ├── GET /api/pedidos/latest/:limit
    ├── GET /api/pedidos/date-range
    └── GET /api/pedidos/producto/:productoId
```

---

## Response Examples

### Success Response (Single Item)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Arroz Integral 1kg",
    "precio": 150.50,
    "peso": "1kg",
    "img_url": "https://example.com/arroz.jpg",
    "descripcion": "Arroz integral de alta calidad",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Success Response (Multiple Items)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Producto 1",
      "precio": 100.00
    },
    {
      "id": 2,
      "nombre": "Producto 2",
      "precio": 200.00
    }
  ]
}
```

### Success Response (With Pagination)

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Producto not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Missing required fields: nombre and precio are required"
}
```

---

## Testing Tips

1. **Start the server first**: `npm run dev`
2. **Check health endpoint** before testing other endpoints
3. **Use pagination** for large datasets to improve performance
4. **Test error cases** (invalid IDs, missing fields, etc.)
5. **Check response status codes**:
   - `200` - Success
   - `201` - Created
   - `400` - Bad Request
   - `404` - Not Found
   - `500` - Server Error

---

## Automated Testing with Scripts

### Bash Script Example

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing Health Check..."
curl -s "$BASE_URL/api/health" | jq

echo "\nTesting Get All Productos..."
curl -s "$BASE_URL/api/productos" | jq

echo "\nTesting Create Producto..."
curl -s -X POST "$BASE_URL/api/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Product",
    "precio": 100
  }' | jq

echo "\nTests completed!"
```

Save as `test-api.sh`, make executable with `chmod +x test-api.sh`, and run with `./test-api.sh`

---

**Happy Testing! 🧪**