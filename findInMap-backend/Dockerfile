FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy Drizzle configuration and migrations
COPY drizzle.config.ts ./
COPY drizzle ./drizzle

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build application
RUN pnpm build

# Expose port
EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]