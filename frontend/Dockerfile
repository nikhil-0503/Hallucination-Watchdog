# Build stage
FROM node:22-alpine AS builder

WORKDIR /build

# Copy package files from frontend
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY public/ ./public/
COPY src/ ./src/

# Build the app
ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV CI=false

RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy built app
COPY --from=builder /build/build ./

# Copy server script
COPY server.js ./

# If a platform runs `npm start`, ensure /app/package.json exists.
COPY runtime.package.json ./package.json

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
