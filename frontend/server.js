const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

function normalizeBackendUrl(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  return trimmed.replace(/\/api$/i, '');
}

function resolveBackendConfig() {
  const candidates = {
    BACKEND_URL: process.env.BACKEND_URL || '',
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || '',
    API_URL: process.env.API_URL || '',
    BACKEND_API_URL: process.env.BACKEND_API_URL || ''
  };

  let selectedRaw =
    candidates.BACKEND_URL ||
    candidates.REACT_APP_API_URL ||
    candidates.API_URL ||
    candidates.BACKEND_API_URL ||
    '';

  // Emergency production fallback for mixed Railway instances where
  // one replica may not receive latest env vars during rolling deploy.
  if (!selectedRaw) {
    selectedRaw = process.env.DEFAULT_BACKEND_URL || '';
  }

  if (!selectedRaw) {
    selectedRaw = 'https://hallucination-watchdog-production-e39c.up.railway.app';
  }

  const source = candidates.BACKEND_URL
    ? 'BACKEND_URL'
    : candidates.REACT_APP_API_URL
    ? 'REACT_APP_API_URL'
    : candidates.API_URL
    ? 'API_URL'
    : candidates.BACKEND_API_URL
    ? 'BACKEND_API_URL'
    : process.env.DEFAULT_BACKEND_URL
    ? 'DEFAULT_BACKEND_URL'
    : selectedRaw
    ? 'HARDCODED_PROD_FALLBACK'
    : null;

  const backendBaseUrl = normalizeBackendUrl(selectedRaw);
  return { candidates, selectedRaw, source, backendBaseUrl };
}

function getBackendConfigDebug() {
  const { selectedRaw, source, backendBaseUrl } = resolveBackendConfig();
  const instance = process.env.RAILWAY_REPLICA_ID || process.env.HOSTNAME || `pid-${process.pid}`;

  return {
    configured: !!backendBaseUrl,
    instance,
    selected_source: source,
    selected_value_present: !!selectedRaw,
    selected_value_preview: selectedRaw ? `${selectedRaw.slice(0, 28)}...` : null,
    normalized_preview: backendBaseUrl ? `${backendBaseUrl.slice(0, 28)}...` : null
  };
}

function proxyApiRequest(req, res) {
  const { backendBaseUrl } = resolveBackendConfig();

  if (!backendBaseUrl) {
    const instance = process.env.RAILWAY_REPLICA_ID || process.env.HOSTNAME || `pid-${process.pid}`;
    res.writeHead(503, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });
    res.end(JSON.stringify({
      error: 'Backend URL is not configured',
      detail: 'Set BACKEND_URL, REACT_APP_API_URL, API_URL, or BACKEND_API_URL to your backend service URL',
      instance
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
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });
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
