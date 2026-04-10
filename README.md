# MapVest

A full-stack SaaS platform for visualizing clients, suppliers, and points of
interest on interactive maps, optimizing visit routes, and managing territory
assignments for field teams. Built with a monorepo architecture.

**Live**: [map-vest.com](https://www.map-vest.com/)

## Project Structure

```
findInMap/
├── findInMap-backend/      # Express API (TypeScript, PostgreSQL + PostGIS)
├── findInMap-frontend/     # React SPA (TypeScript, Vite, Leaflet)
├── findInMap-website/      # Static marketing site (GitHub Pages)
└── scripts/                # Utility scripts
```

This is a **pnpm workspaces** monorepo.

## Features

- **Interactive maps** with Leaflet, drawing tools (Geoman), and heatmap
  visualization
- **Route optimization** for planning efficient visit sequences
- **Territory management** with drawable zones on the map
- **Multi-tenant model** with groups, role-based access (owner / admin /
  contributor), and per-group plans
- **Custom categories** with color coding for map points
- **Data import** from Excel and CSV files
- **Public map sharing** via unique links
- **Address search** powered by Google Maps API
- **Charts and analytics** with Recharts
- **Payments** via Stripe (checkout, webhooks, plan upgrades)
- **Email notifications** via Resend (password reset, etc.)
- **JWT authentication** with access/refresh token rotation and automatic
  blacklist cleanup
- **Internationalization** (i18n) with React Intl
- **Swagger / OpenAPI** documentation at `/swagger`

## Tech Stack

| Layer    | Technology                                               |
| -------- | -------------------------------------------------------- |
| Frontend | React, TypeScript, Vite, React Router, Leaflet, Recharts |
| Backend  | Node.js, Express, TypeScript, Drizzle ORM                |
| Database | PostgreSQL + PostGIS                                     |
| Auth     | JWT (jsonwebtoken), Helmet, CORS                         |
| Payments | Stripe                                                   |
| Email    | Resend                                                   |
| Testing  | Jest, Supertest                                          |
| Tooling  | pnpm, Prettier, tsx, Docker Compose                      |
| CI/CD    | GitHub Actions (website deploy to GitHub Pages)          |

## Architecture

Both frontend and backend follow **Clean Architecture** principles:

### Backend

```
src/
├── main/              # Entry point, config, DI container
├── core/
│   ├── entities/      # Domain models
│   ├── dtos/          # Data transfer objects
│   ├── usecases/      # Business logic
│   ├── services/      # JWT, logging, email, token blacklist
│   ├── errors/        # Custom error classes
│   └── dependencies/  # Dependency injection interfaces
├── db/                # Drizzle ORM schema & client
├── dependency-implementations/  # Repository implementations
└── interfaces/rest/   # Express routes, middlewares, OpenAPI schemas
```

### Frontend

```
src/
├── core/
│   ├── api/           # API client
│   ├── usecases/      # Business logic hooks
│   ├── dtos/          # Data transfer objects
│   └── contexts/      # React context providers
├── ui/
│   ├── views/         # Page components
│   ├── components/    # Reusable components
│   └── styles/        # Global theme
└── i18n/              # Translations
```

## API Overview

36 REST endpoints organized by resource:

| Resource       | Endpoints                                                    |
| -------------- | ------------------------------------------------------------ |
| Users          | Register, login, logout, get profile, update, password reset |
| Token          | Refresh                                                      |
| Groups         | Get, update, add/remove users, change roles                  |
| Maps           | CRUD, public access                                          |
| Map Points     | CRUD, bulk import (Excel/CSV)                                |
| Map Categories | CRUD                                                         |
| Plans          | List available plans                                         |
| Payments       | Stripe checkout, webhook                                     |
| Search         | Address search (Google Maps)                                 |
| System         | Health check, info                                           |

Full Swagger documentation is available at `/swagger`.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 10
- Docker (for the PostgreSQL + PostGIS database)

### Installation

```bash
# Install all dependencies
pnpm install

# Start the database
cd findInMap-backend && pnpm docker:up

# Run migrations
pnpm db:migrate
```

### Development

```bash
# Start both frontend and backend
pnpm dev

# Or individually
pnpm backend    # http://localhost:3001
pnpm frontend   # http://localhost:3000
```

### Database Commands

```bash
cd findInMap-backend

pnpm docker:up       # Start PostgreSQL container
pnpm docker:down     # Stop PostgreSQL container
pnpm db:generate     # Generate migrations from schema changes
pnpm db:migrate      # Apply pending migrations
pnpm db:push         # Push schema directly (development)
pnpm db:studio       # Open Drizzle Studio (visual DB browser)
```

### Testing

```bash
cd findInMap-backend

pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
pnpm test:e2e         # End-to-end tests
```

### Mock Server

The frontend includes **MSW** (Mock Service Worker) for offline development.
When running in development mode without a backend, the app uses mock data.

## Deployment

The backend is containerized with Docker and deployed to **Railway**. The
`deploy` script builds, migrates, and starts the server:

```bash
cd findInMap-backend
pnpm deploy
```

The marketing website is deployed to **GitHub Pages** via a GitHub Actions
workflow on push to `main`.

## License

CC-BY-NC-ND-4.0

## Author

Paolo Dell'Aguzzo
