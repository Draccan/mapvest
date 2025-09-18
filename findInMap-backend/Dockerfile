FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json (senza pnpm-lock.yaml)
COPY package.json ./

# Install dependencies (senza lockfile)
RUN pnpm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build application
RUN pnpm build

# Expose port
EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]