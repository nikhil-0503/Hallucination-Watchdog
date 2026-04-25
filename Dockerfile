# Root-level Dockerfile for Railway - builds frontend
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
COPY frontend/tsconfig.json ./

# Build the app with environment variables
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV CI=false

RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built frontend from builder
COPY --from=builder /build/build ./build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
