const fs = require('fs');
const path = require('path');
const fastifyFactory = require('fastify');
const cors = require('@fastify/cors');
const websocket = require('@fastify/websocket');
const { advanceFleet, createFleet } = require('./simulation');

const UPDATE_INTERVAL_MS = 3000;

function loadRoutes() {
  const routesDirectory = path.join(__dirname, '..', 'routes');
  return fs
    .readdirSync(routesDirectory)
    .filter((file) => file.endsWith('.geojson'))
    .sort()
    .map((file) => JSON.parse(fs.readFileSync(path.join(routesDirectory, file), 'utf8')));
}

function buildServer() {
  const fastify = fastifyFactory({ logger: true });
  const routes = loadRoutes();
  const routesById = new Map(routes.map((route) => [route.properties.route_id, route]));
  const vehicles = createFleet(routes);
  const clients = new Set();

  fastify.register(cors, { origin: true });
  fastify.register(websocket);

  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.get('/routes', async () => routes);

  fastify.get('/ws', { websocket: true }, (connection) => {
    clients.add(connection.socket);
    fastify.log.info('WebSocket client connected');

    connection.socket.on('close', () => {
      clients.delete(connection.socket);
      fastify.log.info('WebSocket client disconnected');
    });
  });

  const broadcastUpdates = () => {
    const updates = advanceFleet({
      vehicles,
      routesById,
      elapsedSeconds: UPDATE_INTERVAL_MS / 1000
    });
    const payload = JSON.stringify(updates);

    for (const client of clients) {
      if (client.readyState === 1) {
        client.send(payload);
      }
    }
  };

  const interval = setInterval(broadcastUpdates, UPDATE_INTERVAL_MS);
  fastify.addHook('onClose', (_instance, done) => {
    clearInterval(interval);
    done();
  });

  return fastify;
}

async function start() {
  const server = buildServer();
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { buildServer };
