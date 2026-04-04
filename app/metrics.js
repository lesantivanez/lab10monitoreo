const client = require("prom-client");

const register = new client.Registry();

// Métricas por defecto (CPU, memoria, etc.)
client.collectDefaultMetrics({ register });

// Métrica personalizada: contador de requests
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  registers: [register]
});

// Métrica personalizada: duración
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests",
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

module.exports = {
  register,
  httpRequestCounter,
  httpRequestDuration
};