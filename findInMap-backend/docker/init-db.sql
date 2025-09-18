-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO findinmap;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO findinmap;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO findinmap;