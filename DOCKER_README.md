# Docker Setup for Restaurant Reservation System

This project contains Docker configurations for running the Table Availability and Reservation microservices.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Services

1. **Table Availability Service** - Runs on port 3002
2. **Reservation Service** - Runs on port 3001

## Quick Start

To start both services with health checks:

```bash
docker-compose up --build --detach
```

## Environment Variables

Each service has its own `.env.docker` file:

- `table-availability/.env.docker`
- `reservation/.env.docker`

## Accessing the Services

- Table Availability Service: http://localhost:3002
- Reservation Service: http://localhost:3001

## Stopping the Services

To stop the services:

```bash
docker-compose down
```

## Health Checks

The full docker-compose.yml includes health checks for both services. The Reservation service will wait for the Table Availability service to be healthy before starting.

## Troubleshooting

If you encounter any issues:

1. Make sure Docker is running on your system
2. Check that the ports 3001 and 3002 are not being used by other applications
3. Clear Docker cache if needed: `docker system prune -a`