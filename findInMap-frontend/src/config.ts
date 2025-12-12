export const API_URL =
    import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export const MAX_TRIP_CALCULATION_MAP_POINTS =
    parseInt(import.meta.env.VITE_MAX_TRIP_CALCULATION_MAP_POINTS) || 100;
