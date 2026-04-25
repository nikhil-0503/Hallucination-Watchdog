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

# Production stage - minimal Node.js server
FROM node:22-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /build/build ./

# Create simple HTTP server script
RUN cat > server.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // For SPA, serve index.html on 404
      fs.readFile(path.join(__dirname, 'index.html'), (err2, data2) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data2 || 'Not found');
      });
    } else {
      const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      }[ext] || 'application/octet-stream';
      
      res.writeHead(200, {'Content-Type': contentType});
      res.end(data);
    }
  });
}).listen(PORT, () => {
  console.log(`Frontend served on port ${PORT}`);
});
EOF

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
