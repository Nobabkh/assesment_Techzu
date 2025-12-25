# MERN Stack Comment System

A full-featured, real-time comment system built with MERN (MongoDB, Express, React, Node.js), TypeScript, Prisma, and Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Running with Docker

### Production Environment

To run the application in production mode:

```bash
docker-compose up -d
```

This will start:
- MongoDB database on port 27017
- Backend API on port 5000
- Frontend application on port 3000

### Development Environment

To run the application in development mode with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- MongoDB database with replica set on port 27017
- Backend API on port 5000 (with hot reload)
- Frontend application on port 3000 (with hot reload)

## Access the Application

After starting the containers, access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## Stopping the Application

To stop all running containers:

```bash
# Production
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml down
```

To stop and remove all volumes (this will delete all data):

```bash
# Production
docker-compose down -v

# Development
docker-compose -f docker-compose.dev.yml down -v
```

## Viewing Logs

To view logs from all services:

```bash
# Production
docker-compose logs -f

# Development
docker-compose -f docker-compose.dev.yml logs -f
```

To view logs from a specific service:

```bash
# Production
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Development
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f mongodb
```

## Environment Variables

The application uses default environment variables configured in the Docker Compose files. For production deployments, you may want to customize these values:

### Production Environment Variables (docker-compose.yml)

- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `NODE_ENV`: Set to `production`

### Development Environment Variables (docker-compose.dev.yml)

- `DATABASE_URL`: MongoDB connection string with replica set
- `JWT_SECRET`: Secret key for JWT authentication
- `NODE_ENV`: Set to `development`
- `VITE_API_URL`: Backend API URL for frontend

## Troubleshooting

If you encounter issues:

1. **Check if containers are running**:
   ```bash
   docker-compose ps
   ```

2. **View container logs**:
   ```bash
   docker-compose logs
   ```

3. **Rebuild containers**:
   ```bash
   docker-compose up -d --build
   ```

4. **Remove and recreate containers**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Default Credentials

The application uses the following default MongoDB credentials:

- **Username**: admin
- **Password**: password

For production deployments, please update these credentials in the [`docker-compose.yml`](docker-compose.yml) file.