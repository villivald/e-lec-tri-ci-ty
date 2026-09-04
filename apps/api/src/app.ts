import Fastify, { type FastifyInstance } from 'fastify';

export const buildApp = (): FastifyInstance => {
  const app = Fastify({ logger: true });

  app.get('/health/live', async () => ({ status: 'ok' as const }));

  return app;
};
