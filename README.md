# 88-API: TypeScript Backend API with Bun

A high-performance TypeScript backend API powered by Bun, featuring JWT authentication, SQLite database with Drizzle ORM, and functional programming principles.

## 🚀 Features

- **Bun Runtime**: Leverages Bun's speed and all-in-one toolkit
- **TypeScript**: Strong static typing for improved code quality
- **JWT Authentication**: Secure, stateless authentication
- **SQLite Database**: Lightweight, file-based database with Drizzle ORM
- **Functional Programming**: Immutability, pure functions, and explicit error handling
- **RESTful API**: Standardized endpoints for CRUD operations
- **Comprehensive Testing**: Unit and integration tests with Bun's test runner

## 📋 Prerequisites

- **Bun**: Install from [bun.sh](https://bun.sh)
- **SQLite**: Development libraries (usually pre-installed)

### Installing Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd 88-api
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL=file:./data.db
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters
   JWT_EXPIRATION_MINUTES=60
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=info
   ```

4. **Run database migrations**
   ```bash
   bun run db:push
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
bun run dev
```

### Production Mode
```bash
bun run start
```

### Build for Production
```bash
bun run build
bun ./dist/index.js
```

The API will be available at `http://localhost:3000`

## 🧪 Testing

Run all tests:
```bash
bun test
```

Run tests in watch mode:
```bash
bun test --watch
```

## 📚 API Endpoints

### Authentication

#### `POST /auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `POST /auth/login`
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_access_token",
  "refreshToken": "refresh_token_uuid"
}
```

#### `GET /auth/me`
Get current user's profile (requires JWT).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### `POST /auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_uuid"
}
```

### Users

#### `GET /users`
Get all users with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

#### `GET /users/:id`
Get user by ID.

#### `PUT /users/:id`
Update user information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### `DELETE /users/:id`
Delete user.

### Health Check

#### `GET /health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "version": "1.0.0"
}
```

## 🏗️ Project Structure

```
src/
├── index.ts                 # Main application entry point
├── api/                     # API routes and handlers
│   ├── index.ts            # API router
│   ├── auth.ts             # Authentication routes
│   ├── users.ts            # User routes
│   └── health.ts           # Health check
├── config/                  # Application configuration
│   └── index.ts            # Config loading and validation
├── db/                      # Database layer
│   ├── index.ts            # Database exports
│   ├── schema.ts           # Drizzle schema definitions
│   ├── models.ts           # TypeScript interfaces
│   └── client.ts           # Database connection
├── handlers/                # Business logic (pure functions)
│   ├── index.ts            # Handler exports
│   ├── auth.ts             # Authentication logic
│   └── users.ts            # User management logic
├── middleware/              # Custom middleware
│   ├── index.ts            # Middleware exports
│   └── jwtAuth.ts          # JWT authentication
├── utils/                   # Pure utility functions
│   ├── index.ts            # Utility exports
│   ├── result.ts           # Result type for error handling
│   ├── errors.ts           # Custom error types
│   ├── jwt.ts              # JWT utilities
│   └── password.ts         # Password utilities
└── tests/                   # Test files
    ├── common/              # Test utilities
    └── api/                 # API tests
```

## 🔧 Functional Programming Principles

This project emphasizes functional programming principles:

### Immutability
- All data structures are immutable once created
- Use spread operators and pure functions for data transformations
- Configuration objects are frozen after loading

### Pure Functions
- Business logic in `handlers/` takes all dependencies as parameters
- No side effects in pure functions
- Easy to test and reason about

### Explicit Error Handling
- Uses `Result<T, E>` type for explicit success/failure handling
- No exceptions for expected failures
- Type-safe error responses

### Higher-Order Functions
- Extensive use of `map`, `filter`, `reduce`
- Function composition for complex operations
- Dependency injection for testability

## 🗄️ Database

### Schema
The application uses SQLite with Drizzle ORM:

- **Users**: Authentication and user management
- **Items**: Example entity for CRUD operations
- **Refresh Tokens**: JWT refresh token storage

### Migrations
```bash
# Generate migration
bun run db:generate

# Apply migrations
bun run db:push

# Open Drizzle Studio
bun run db:studio
```

## 🚀 Deployment

### Docker
```bash
docker build -t 88-api .
docker run -p 3000:3000 88-api
```

### Environment Variables
Required environment variables:
- `DATABASE_URL`: SQLite database file path
- `JWT_SECRET`: Secret key for JWT signing (min 32 chars)
- `JWT_EXPIRATION_MINUTES`: Token expiration time
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production/test)

## 🧪 Testing Strategy

### Unit Tests
- Pure functions in `utils/` and `handlers/`
- Mock dependencies for isolation
- Test error cases explicitly

### Integration Tests
- API endpoint testing
- Database integration
- Authentication flow testing

### Test Commands
```bash
bun test                    # Run all tests
bun test --watch           # Watch mode
bun test src/tests/api/    # Run API tests only
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow functional programming principles
4. Write tests for new functionality
5. Ensure all tests pass (`bun test`)
6. Format code (`bun fmt`)
7. Commit changes (`git commit -m 'feat: Add amazing feature'`)
8. Push to branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Check the health endpoint for API status
- Review the test files for usage examples

---

**Built with ❤️ using Bun, TypeScript, and Functional Programming principles** 