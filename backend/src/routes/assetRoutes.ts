// backend/src/routes/assetRoutes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const fixedAssets = [
  { id: 'A001', name: "Ação Petrobras", symbol: "PETR4", value: 35.50 },
  { id: 'A002', name: "Fundo Imobiliário XPTO", symbol: "XPTO11", value: 102.75 },
  { id: 'A003', name: "Tesouro Selic 2029", symbol: "LFT2029", value: 14500.00 }
];

export default async function assetRoutes(server: FastifyInstance) {
  server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    // Em uma aplicação real, você poderia buscar isso de uma fonte externa ou outro serviço.
    // Para este case, é uma lista fixa.
    return reply.send(fixedAssets);
  });
}