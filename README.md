# Restaurant Reservation System

A microservice-based restaurant reservation system built with Bun.js, TypeScript, and PostgreSQL. This system consists of two main services: Table Availability Service and Reservation Service, designed to handle restaurant table availability and customer reservations efficiently.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Services](#services)
  - [Table Availability Service](#table-availability-service)
  - [Reservation Service](#reservation-service)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Running with Docker](#running-with-docker)
  - [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Development](#development)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Future Roadmap](#future-roadmap)
- [License](#license)

## Project Overview

This Restaurant Reservation System is designed to manage restaurant table availability and customer reservations. It follows a microservice architecture with separate services for managing table availability and handling reservations, communicating through REST APIs.

## Architecture

The system consists of:
- Two microservices (Table Availability and Reservation)
- Two PostgreSQL databases (one for each service)
- Docker containers for consistent deployment
- Health checks for monitoring service status

## Services

### Table Availability Service

Manages restaurant table information and availability status:
- Tracks table capacity and location
- Manages table availability status
- Exposes APIs for checking table availability

**Port**: 3000 (Docker), 3002 (Standalone)

### Reservation Service

Handles customer reservations:
- Creates and manages reservations
- Validates reservation constraints
- Communicates with Table Availability Service
- Stores customer information and reservation details

**Port**: 3000 (Docker), 3001 (Standalone)

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Bun.js](https://bun.sh/) (for local development)
- Node.js (optional, for tooling)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/onahkenneth/binary-tech-assessment.git
cd binary-tech-assessment
```

2. Install dependencies for each service:
```bash
cd table-availability && bun install
cd ../reservation && bun install
```

## Usage

### Running with Docker

For detailed Docker instructions, see [DOCKER_README.md](DOCKER_README.md).

Quick start:
```bash
docker-compose up --build --detach
```

Services will be available at:
- Table Availability Service: http://localhost:3000
- Reservation Service: http://localhost:3001

### Running Locally

1. Start databases:
```bash
# You'll need to set up PostgreSQL instances locally
# Update .env.local files with your local database credentials
```

2. Run database migrations and seed data:
```bash
cd table-availability && bun run setup
cd ../reservation && bun run setup
```

3. Start services:
```bash
# In one terminal
cd table-availability && bun run dev

# In another terminal
cd reservation && bun run dev
```

## API Endpoints

### Table Availability Service
- `GET /tables` - Get all tables
- `GET /tables/:id` - Get a specific table
- `POST /tables` - Create a new table
- `PUT /tables/:id` - Update a table
- `DELETE /tables/:id` - Delete a table

### Reservation Service
- `GET /reservations` - Get all reservations
- `GET /reservations/:id` - Get a specific reservation
- `POST /reservations` - Create a new reservation
- `PUT /reservations/:id` - Update a reservation
- `DELETE /reservations/:id` - Delete a reservation

## Database Schema

Each service has its own PostgreSQL database:

### Table Availability Database
- Tables table: Stores table information (capacity, location, etc.)

### Reservation Database
- Reservations table: Stores reservation details (customer info, table, preferences)
- Customers table: Customer information
- Waitlists table: Waitlist information

## Development

### Tech Stack

- **Runtime**: [Bun.js](https://bun.sh/)
- **Language**: TypeScript
- **Framework**: None (using native Bun.serve)
- **Database**: PostgreSQL with Drizzle ORM
- **Containerization**: Docker
- **Testing**: Bun Test

### Project Structure Summary

```
binary-tech-assessment/
├── table-availability/   # Table availability microservice
│   ├── src/              # Source code
│   │   ├── db/           # Database related code
│   │   └── helpers/      # Helpers and utilities
│   │   └── services/     # Services
│   │   └── models/       # data repositories
│   │   └── types/        # TypeScript types definition
│   │   └── routes.ts     # API route handlers
│   │   └── server.ts     # App server
│   ├── public/           # static assets
│   ├── package.json      # Dependencies and scripts
│   └── .env.docker       # Docker environment variables
│   └── Dockerfile        # Docker build
│   └── package.json      # Dependencies, configs and scripts
│   └── test              # Test suites 
├── reservation/          # Reservation microservice
│   ├── src/              # Source code
│   │   ├── db/           # Database related code
│   │   └── helpers/      # Helpers and utilities
│   │   └── services/     # Services
│   │   └── models/       # data repositories
│   │   └── types/        # TypeScript types definition
│   │   └── routes.ts     # API route handlers
│   │   └── server.ts     # App server
│   ├── public/           # static assets
│   ├── package.json      # Dependencies and scripts
│   └── .env.docker       # Docker environment variables
│   └── Dockerfile        # Docker build
│   └── package.json      # Dependencies, configs and scripts
│   └── test              # Test suites 
├── docker-compose.yml    # Docker configuration
└── DOCKER_README.md      # Docker-specific documentation
```

## Troubleshooting

Common issues and solutions:

1. **Docker port conflicts**
   - Make sure ports 3000, 3001, 5432, and 5433 are free
   - Check with: `lsof -i :3000` (or other port numbers)
   - Solution: Stop conflicting processes or change ports in docker-compose.yml

2. **Database connection failures**
   - Verify database credentials in .env.docker files
   - Ensure PostgreSQL containers are running: `docker-compose ps`
   - Check database logs: `docker-compose logs table-db`

3. **Service dependency issues**
   - Reservation service waits for Table Availability service
   - If one service fails to start, check its logs: `docker-compose logs <service-name>`

4. **Health check failures**
   - Check that services are properly configured
   - Verify environment variables
   - Restart services: `docker-compose restart`

5. **Permission issues**
   - Make sure you have proper permissions to run Docker commands
   - On Linux, you might need to run with sudo or add your user to the docker group

For more Docker-specific troubleshooting, refer to [DOCKER_README.md](DOCKER_README.md).

## Contributing

We welcome contributions to improve the Restaurant Reservation System!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new functionality
- Update documentation when making changes
- Keep commits focused and descriptive
- Follow the existing code style

### Running Tests

```bash
# Run tests for table-availability service
cd table-availability && bun test

# Run tests for reservation service
cd ../reservation && bun test
```

## Future Roadmap

### Short-term Goals (Next 3 months)
- [ ] Optimal fulfillment with graph traversal weighted by both preference matching and table relationships.
- [ ] Add user authentication and authorization
- [ ] Implement rate limiting for API endpoints
- [ ] Add comprehensive logging and monitoring
- [ ] Create admin dashboard for managing tables and reservations
- [ ] Add notification system for reservation confirmations
- [ ] Manages available time slots for tables

### Medium-term Goals (3-6 months)
- [ ] Implement real-time updates using WebSockets
- [ ] Add support for special requests (high chair, window seat, etc.)
- [ ] Create customer portal for managing reservations
- [ ] Add analytics dashboard for restaurant owners
- [ ] Implement cancellation policies and fees

### Long-term Goals (6+ months)
- [ ] Mobile application for customers
- [ ] Integration with payment processors
- [ ] Support for multiple restaurant locations
- [ ] Machine learning for demand forecasting
- [ ] Loyalty program integration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*For Docker-specific instructions, please refer to [DOCKER_README.md](DOCKER_README.md)*