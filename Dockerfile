# Root-level Dockerfile for Railway - builds and serves frontend
# Build stage
FROM node:22-alpine AS builder

WORKDIR /build

# Copy package files from frontend
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/public/ ./public/
COPY frontend/src/ ./src/

# Build the app with environment variables
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV CI=false

RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy built app
COPY --from=builder /build/build ./

# Copy server script
COPY frontend/server.js ./

# If Railway (or a platform setting) runs `npm start`, ensure /app/package.json exists.
COPY frontend/runtime.package.json ./package.json

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
