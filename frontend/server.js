const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const rawBackendUrl = process.env.BACKEND_URL || process.env.REACT_APP_API_URL || '';

function normalizeBackendUrl(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  return trimmed.replace(/\/api$/i, '');
}

const backendBaseUrl = normalizeBackendUrl(rawBackendUrl);

function getBackendConfigDebug() {
  const candidates = {
    BACKEND_URL: process.env.BACKEND_URL || '',
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || '',
    API_URL: process.env.API_URL || '',
    BACKEND_API_URL: process.env.BACKEND_API_URL || ''
  };

  const selectedRaw =
    candidates.BACKEND_URL ||
    candidates.REACT_APP_API_URL ||
    candidates.API_URL ||
    candidates.BACKEND_API_URL ||
    '';

  let resolved = '';
  try {
    resolved = normalizeBackendUrl(selectedRaw);
  } catch (_) {
    resolved = '';
  }

  return {
    configured: !!resolved,
    selected_source: candidates.BACKEND_URL
      ? 'BACKEND_URL'
      : candidates.REACT_APP_API_URL
      ? 'REACT_APP_API_URL'
      : candidates.API_URL
      ? 'API_URL'
      : candidates.BACKEND_API_URL
      ? 'BACKEND_API_URL'
      : null,
    selected_value_present: !!selectedRaw,
    selected_value_preview: selectedRaw ? `${selectedRaw.slice(0, 28)}...` : null,
    normalized_preview: resolved ? `${resolved.slice(0, 28)}...` : null
  };
}

function proxyApiRequest(req, res) {
  if (!backendBaseUrl) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Backend URL is not configured',
      detail: 'Set BACKEND_URL or REACT_APP_API_URL to your backend service URL'
    }));
    return;
  }

  let target;
  try {
    target = new URL(req.url, backendBaseUrl);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid backend URL configuration', detail: String(e) }));
    return;
  }

  const transport = target.protocol === 'https:' ? https : http;
  const headers = { ...req.headers, host: target.host };

  const proxyReq = transport.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? 443 : 80),
      method: req.method,
      path: `${target.pathname}${target.search}`,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Failed to reach backend service',
      detail: String(error)
    }));
  });

  req.pipe(proxyReq);
}

http.createServer((req, res) => {
  if (req.url === '/api/_proxy-debug') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getBackendConfigDebug()));
    return;
  }

  if (req.url.startsWith('/api/')) {
    proxyApiRequest(req, res);
    return;
  }

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
