const client = require('prom-client');

// Create a Registry to hold all metrics
const register = new client.Registry();

// Collect default Node.js metrics (event loop lag, memory, GC, CPU)
client.collectDefaultMetrics({ register });

// Custom metric: HTTP request duration
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Custom metric: HTTP request counter
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestCounter);

module.exports = { register, httpRequestDuration, httpRequestCounter };