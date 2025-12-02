import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);

async function bootstrap() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
  });

  app.get('/status', async () => ({
    name: 'black-square-backend',
    status: 'ready',
    timestamp: new Date().toISOString(),
  }));

  app.post<{ Body: { note: string } }>('/telemetry', async (request) => {
    const { note } = request.body;

    return {
      accepted: true,
      note,
      receivedAt: new Date().toISOString(),
    };
  });

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`API listening on http://localhost:${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

bootstrap();

