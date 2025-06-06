// backend/src/index.ts
import Fastify, { FastifyInstance } from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { ZodTypeProvider } from 'fastify-type-provider-zod'; // 1. Importe o ZodTypeProvider

import prisma from './db';
import clientRoutes from './routes/clientRoutes';
import assetRoutes from './routes/assetRoutes';

dotenv.config();

// 2. Crie a instância do Fastify E ADICIONE o .withTypeProvider<ZodTypeProvider>()
const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>(); // <--- ADICIONE ISSO AQUI!
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

// Após o `.withTypeProvider<ZodTypeProvider>()`
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],


});

server.register(sensible);

server.register(clientRoutes, { prefix: '/api/clients' });
server.register(assetRoutes, { prefix: '/api/assets' });
server.get('/',(request,reply)=>{
  reply.send("Olá, está rodando");
});
server.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return reply.status(200).send({
      status: 'ok',
      message: 'API e Banco de Dados funcionando!',
      timestamp: new Date().toISOString(),
    });
  } catch (dbError) {
    server.log.error(dbError, 'Erro de conexão com o banco de dados no health check');
    return reply.status(503).send({
      status: 'error',
      message: 'API funcionando, mas erro ao conectar ao banco de dados.',
      dbError: (dbError as Error).message,
    });
  }
});

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    await prisma.$connect();
    server.log.info('Conectado ao banco de dados com sucesso!');
    await server.listen({ port: PORT, host: HOST });
  } catch (err) {
    await prisma.$disconnect();
    server.log.error(err);
    process.exit(1);
  }
};

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    server.log.info(`Recebido sinal ${signal}, desligando servidor...`);
    await server.close();
    await prisma.$disconnect();
    server.log.info('Servidor e conexão com o banco de dados desligados.');
    process.exit(0);
  });
});

start();