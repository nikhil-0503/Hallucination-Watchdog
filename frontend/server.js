const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

function normalizeApiBaseUrl(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = String(rawUrl).trim().replace(/\/+$/, '');
  return trimmed.replace(/\/api$/i, '');
}

function resolveRuntimeApiBaseUrl() {
  const candidates = [
    process.env.BACKEND_INTERNAL_URL,
    process.env.BACKEND_INTERNAL_URI,
    process.env.BACKEND_URL,
    process.env.BACKEND_URI,
    process.env.REACT_APP_API_URL,
    process.env.REACT_APP_API_URI,
    process.env.API_URL,
    process.env.API_URI,
    process.env.BACKEND_API_URL,
    process.env.BACKEND_API_URI
  ];

  for (const rawUrl of candidates) {
    if (!rawUrl) {
      continue;
    }

    const normalized = normalizeApiBaseUrl(rawUrl);
    if (normalized) {
      return normalized;
    }
  }

  return '';
}

function injectRuntimeConfig(html) {
  const runtimeConfig = {
    API_BASE_URL: resolveRuntimeApiBaseUrl()
  };

  const script = `<script>window.__WATCHDOG_RUNTIME_CONFIG__ = ${JSON.stringify(runtimeConfig)};</script>`;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${script}\n</head>`);
  }

  return `${script}\n${html}`;
}

function sendHtmlWithRuntimeConfig(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(injectRuntimeConfig(html));
}

http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // For SPA, serve index.html on 404
      fs.readFile(path.join(__dirname, 'index.html'), (err2, data2) => {
        if (data2) {
          sendHtmlWithRuntimeConfig(res, data2.toString());
        } else {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end('Not found');
        }
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
      
      if (ext === '.html') {
        sendHtmlWithRuntimeConfig(res, data.toString());
        return;
      }

      res.writeHead(200, {'Content-Type': contentType});
      res.end(data);
    }
  });
}).listen(PORT, () => {
  console.log(`Frontend served on port ${PORT}`);
});
