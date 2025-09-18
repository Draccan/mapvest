# FindInMap

A full-stack application for mapping and tracking crime incidents with an
interactive map interface.

## Project Structure

This is a monorepo setup with pnpm containing:

- **findInMap-frontend**: React + TypeScript + Vite frontend application
- **findInMap-backend**: Node.js + Express + TypeScript + PostgreSQL + PostGIS
  backend API

## Features

### Frontend

- Interactive map using React-Leaflet
- Form for adding crime incidents with:
  - X/Y coordinates (auto-filled when clicking on map)
  - Crime type selector
  - Date input
  - Save button
- Real-time map updates after adding new points
- MSW (Mock Service Worker) for local API mocking
- Clean architecture with separated layers:
  - `src/core/usecases`: Business logic and API calls
  - `src/core/dtos`: Data transfer objects
  - `src/ui/views`: Page components
  - `src/ui/components`: Reusable components

### Backend

- RESTful API endpoints:
  - `GET /api/map-points`: Retrieve all map points
  - `POST /api/map-points`: Create new map point
- TypeScript + Express setup
- CORS enabled for frontend communication
- Environment configuration with dotenv
- Ready for PostgreSQL + PostGIS integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (latest version)

### Installation

1. Clone the repository and navigate to the project root
2. Install dependencies for all packages:
   ```bash
   pnpm install
   ```

### Development

#### Start both frontend and backend simultaneously:

```bash
pnpm dev
```

#### Or start them individually:

**Backend only:**

```bash
pnpm backend
```

The backend will be available at http://localhost:3001

**Frontend only:**

```bash
pnpm frontend
```

The frontend will be available at http://localhost:3000

### Usage

1. Open http://localhost:3000 in your browser
2. Click anywhere on the map to select coordinates
3. Fill in the crime type and date in the form
4. Click "Save" to add the point to the map
5. The map will automatically refresh and show the new point

### API Endpoints

#### GET /api/map-points

Returns all map points.

#### POST /api/map-points

Creates a new map point.

## Mock Server

The frontend includes MSW (Mock Service Worker) for local development. When
running in development mode, the application will use mock data instead of the
real backend. This allows you to develop the frontend independently.

To disable mocking and use the real backend:

1. Ensure the backend is running on port 3001
2. Edit the `enableMocking` function

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React-Leaflet (for maps)
- MSW (for API mocking)

### Backend

- Node.js
- Express
- TypeScript
- Nodemon (for development)
- dotenv (for environment variables)
- Prisma
- PostgreSQL
- OpenAPI

## License

CC-BY-NC-SA-4.0

## Owner

Paolo Dell'Aguzzo
