const http = require('http');
const https = require('https');

/**
 * Forwards HTTP requests to LLM providers while maintaining authentication and headers.
 * @param {string} url - The URL of the LLM provider.
 * @param {object} req - The original HTTP request.
 * @param {object} res - The original HTTP response.
 */
function forwardRequest(url, req, res) {
    const options = {
        method: req.method,
        headers: { ...req.headers },
    };

    const proxy = url.startsWith('https') ? https : http;

    const proxyReq = proxy.request(url, options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, {
            end: true
        });
    });

    req.pipe(proxyReq, {
        end: true
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.statusCode = 500;
        res.end('Error forwarding request.');
    });
}

module.exports = forwardRequest;
