import 'fastify';

import { buildApp } from './build-app.js';

const DEFAULT_PORT = 3001;
const parsedPort = Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10);
const port = Number.isNaN(parsedPort) ? DEFAULT_PORT : parsedPort;
const app = buildApp();

const closeGracefully = async (): Promise<void> => {
  await app.close();
  process.exit(0);
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

void app.listen({ host: '0.0.0.0', port }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
