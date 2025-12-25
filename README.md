# MERN Stack Comment System

A full-featured, real-time comment system built with MERN (MongoDB, Express, React, Node.js), TypeScript, Prisma, and Docker. This application provides a robust platform for users to create, manage, and interact with comments in real-time.

## 🌟 Features

- **User Authentication**: Secure registration, login, and logout with JWT
- **Comment Management**: Create, read, update, and delete comments
- **Nested Comments**: Support for threaded replies and nested conversations
- **Real-time Updates**: Live comment updates using WebSockets
- **Like/Dislike System**: Interactive voting on comments and replies
- **Advanced Filtering**: Sort and filter comments by various criteria
- **Pagination**: Efficient handling of large comment threads
- **Search Functionality**: Find comments by content
- **Responsive Design**: Optimized for desktop and mobile devices
- **Type Safety**: Full TypeScript implementation for better code quality
- **Containerization**: Docker support for easy deployment

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Modern database toolkit
- **MongoDB** - NoSQL database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time bidirectional event-based communication
- **express-validator** - Input validation

### Frontend
- **React** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time client
- **Tailwind CSS** - Utility-first CSS framework

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container application orchestration
- **Nginx** - Web server and reverse proxy

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/comment-system.git
   cd comment-system
   ```

2. **Environment Setup**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   
   # Frontend environment
   cp frontend/.env.example frontend/.env
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

### Manual Installation

If you prefer to run the application without Docker:

1. **Install MongoDB**
   ```bash
   # Using Docker for MongoDB
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your database configuration
   npm run prisma:migrate
   npm run prisma:generate
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Update .env with your API configuration
   npm start
   ```

## 📖 Usage Examples

### Authentication

```javascript
// Register a new user
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "name": "John Doe"
}

// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Comments

```javascript
// Create a comment
POST /api/comments
Headers: Authorization: Bearer <token>
{
  "content": "This is my comment"
}

// Get comments with pagination
GET /api/comments?page=1&limit=10&sortBy=createdAt&sortOrder=desc

// Like a comment
POST /api/likes/comment/:commentId
Headers: Authorization: Bearer <token>
```

## 📚 API Documentation

For detailed API documentation, including all endpoints, request/response examples, and error handling, please refer to:

- [API Documentation](./docs/API.md)
- [Authentication Guide](./docs/AUTHENTICATION.md)
- [WebSocket Events](./docs/WEBSOCKET.md)

## 🏗️ Project Structure

```
.
├── backend/                 # Node.js/Express API
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── services/      # API service functions
│       ├── store/         # Redux store configuration
│       └── types/         # TypeScript type definitions
│   └── Dockerfile
├── docs/                  # Documentation files
├── docker-compose.yml     # Docker containerization setup
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL="mongodb://admin:password@localhost:27017/comment_system?authSource=admin"

# JWT
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"

# Password Hashing
BCRYPT_SALT_ROUNDS=12

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false
```

## 🚀 Deployment

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Production Environment Variables**
   ```bash
   # Update docker-compose.prod.yml with production values
   ```

### Manual Deployment

For detailed deployment instructions, refer to:

- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Docker Deployment](./docs/DOCKER.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.

## 📝 Changelog

See our [CHANGELOG.md](./CHANGELOG.md) for a history of changes and updates.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
2. Search existing [GitHub Issues](https://github.com/yourusername/comment-system/issues)
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- Thanks to all contributors who have helped make this project better
- Special thanks to the open-source community for the tools and libraries used

---

**Built with ❤️ using modern web technologies**