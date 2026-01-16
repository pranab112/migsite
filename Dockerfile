# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source files
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy server files
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist

# Install only server dependencies
WORKDIR /app/server
RUN npm install --production

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "index.js"]
