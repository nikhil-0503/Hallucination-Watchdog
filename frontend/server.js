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
