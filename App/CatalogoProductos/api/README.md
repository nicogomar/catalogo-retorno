# Catalogo KDN API

Backend API for Catalogo KDN - Built with Node.js, Express, TypeScript, and Supabase.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Production Build](#production-build)

## ✨ Features

- **RESTful API** - Clean and organized REST endpoints
- **TypeScript** - Full type safety and IntelliSense support
- **Supabase Integration** - PostgreSQL database with real-time capabilities
- **CORS Support** - Configurable cross-origin resource sharing
- **Security** - Helmet.js for security headers
- **Logging** - Morgan for HTTP request logging
- **Error Handling** - Centralized error handling middleware
- **Pagination** - Built-in pagination support for large datasets
- **Filtering** - Advanced filtering and search capabilities

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Development**: tsx (TypeScript execution)

## 📁 Project Structure

```
api/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.ts   # Supabase database connection
│   ├── controllers/      # Request handlers
│   │   ├── producto.controller.ts
│   │   └── pedido.controller.ts
│   ├── routes/           # API routes
│   │   ├── index.ts
│   │   ├── producto.routes.ts
│   │   └── pedido.routes.ts
│   ├── services/         # Business logic
│   │   ├── producto.service.ts
│   │   └── pedido.service.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── app.ts            # Express app configuration
│   └── index.ts          # Server entry point
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. **Navigate to the API directory**:
   ```bash
   cd api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env` file in the root of the `api` directory with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | No |

## 📡 API Endpoints

### General

- `GET /` - API welcome message
- `GET /api` - API information and available endpoints
- `GET /api/health` - Health check endpoint

### Productos (Products)

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/productos` | Get all productos | `nombre`, `precioMin`, `precioMax`, `orderBy`, `orderDirection`, `page`, `limit` |
| GET | `/api/productos/:id` | Get producto by ID | - |
| POST | `/api/productos` | Create new producto | - |
| PUT | `/api/productos/:id` | Update producto | - |
| DELETE | `/api/productos/:id` | Delete producto | - |
| GET | `/api/productos/search/:nombre` | Search productos by name | - |
| GET | `/api/productos/latest/:limit?` | Get latest productos | - |
| GET | `/api/productos/order-by-precio/:direction` | Get productos ordered by price | - |

### Pedidos (Orders)

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/pedidos` | Get all pedidos | `nombre_comercio`, `email`, `localidad`, `fechaInicio`, `fechaFin`, `orderBy`, `orderDirection`, `page`, `limit` |
| GET | `/api/pedidos/:id` | Get pedido by ID | - |
| POST | `/api/pedidos` | Create new pedido | - |
| PUT | `/api/pedidos/:id` | Update pedido | - |
| DELETE | `/api/pedidos/:id` | Delete pedido | - |
| GET | `/api/pedidos/search/comercio/:nombre` | Search pedidos by comercio | - |
| GET | `/api/pedidos/search/email/:email` | Search pedidos by email | - |
| GET | `/api/pedidos/search/localidad/:localidad` | Search pedidos by localidad | - |
| GET | `/api/pedidos/latest/:limit?` | Get latest pedidos | - |
| GET | `/api/pedidos/date-range` | Get pedidos by date range | `fechaInicio`, `fechaFin` |
| GET | `/api/pedidos/producto/:productoId` | Get pedidos containing a product | - |

### Request/Response Examples

#### Get all productos
```bash
GET /api/productos?page=1&limit=10&orderBy=precio&orderDirection=asc
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Producto 1",
      "precio": 100,
      "peso": "1kg",
      "img_url": "https://example.com/image.jpg",
      "descripcion": "Description",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Create a new pedido
```bash
POST /api/pedidos
Content-Type: application/json

{
  "nombre_comercio": "Mi Comercio",
  "telefóno": "123456789",
  "email": "comercio@example.com",
  "localidad": "Ciudad",
  "productos": [
    {
      "id": 1,
      "nombre": "Producto 1",
      "precio": 100,
      "quantity": 2
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_comercio": "Mi Comercio",
    "telefóno": "123456789",
    "email": "comercio@example.com",
    "localidad": "Ciudad",
    "productos": [...],
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Pedido created successfully"
}
```

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

### Code Organization

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and database operations
- **Routes**: Define API endpoints and map them to controllers
- **Types**: TypeScript interfaces and type definitions
- **Config**: Application configuration (database, etc.)

## 🏗 Production Build

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Set production environment**:
   ```bash
   export NODE_ENV=production
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

### Deployment Considerations

- Set `NODE_ENV=production` in your environment
- Configure `ALLOWED_ORIGINS` with your frontend URL(s)
- Use a process manager like PM2 for production
- Set up HTTPS with a reverse proxy (nginx, Apache)
- Monitor logs and errors
- Implement rate limiting for production use
- Add authentication/authorization middleware for sensitive endpoints

## 🔒 Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS). Use it carefully.
- In production, protect write endpoints (POST, PUT, DELETE) with authentication.
- Configure CORS properly with your frontend domain.
- Never commit `.env` file to version control.
- Use environment variables for all sensitive data.

## 📝 API Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "meta": { ... } // Optional pagination info
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

---

**Made with ❤️ for Catalogo KDN**