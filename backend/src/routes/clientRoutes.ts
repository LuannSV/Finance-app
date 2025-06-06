// backend/src/routes/clientRoutes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../db'; // Importa nossa instância do Prisma Client
import {
  createClientBodySchema, CreateClientBody, // Usando a convenção PascalCase para tipos
  updateClientBodySchema, UpdateClientBody,
  clientIdParamsSchema, ClientIdParams
} from '../schemas/clientSchema'; // Importa nossos schemas Zod

// Definindo os tipos com PascalCase (opcional, mas boa prática)
// Se você manteve os nomes dos tipos em minúsculo no seu clientSchema.ts, use-os aqui.
// type CreateClientBody = z.infer<typeof createClientBodySchema>; 
// type UpdateClientBody = z.infer<typeof updateClientBodySchema>;
// type ClientIdParams = z.infer<typeof clientIdParamsSchema>;


export default async function clientRoutes(server: FastifyInstance) {

  // Rota para CRIAR um novo cliente
  server.post('/', {
    schema: { // Define o schema para validação do corpo da requisição
      body: createClientBodySchema,
    }
  }, async (request: FastifyRequest<{ Body: CreateClientBody }>, reply: FastifyReply) => {
    try {
      const clientData = request.body;
      const newClient = await prisma.client.create({
        data: clientData,
      });
      return reply.status(201).send(newClient); // 201 Created
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        // Código P2002 do Prisma indica violação de constraint única (neste caso, email)
        return reply.status(409).send({ message: 'Este email já está cadastrado.' }); // 409 Conflict
      }
      server.log.error(error); // Loga o erro no console do servidor
      return reply.status(500).send({ message: 'Erro interno ao criar cliente.' });
    }
  });

  // Rota para LISTAR todos os clientes
  server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const clients = await prisma.client.findMany();
      return reply.send(clients);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ message: 'Erro interno ao buscar clientes.' });
    }
  });

  // Rota para OBTER um cliente específico por ID (MODIFICADA)
server.get('/:id', {
  schema: { params: clientIdParamsSchema }
}, async (request: FastifyRequest<{ Params: ClientIdParams }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const client = await prisma.client.findUnique({
      where: { id: id },
    });

    if (!client) {
      return reply.status(404).send({ message: 'Cliente não encontrado.' });
    }

    // --- MÁGICA DA SIMULAÇÃO AQUI ---
    // Adicionamos uma lista de alocações "fake" ao cliente antes de enviá-lo
    const clientWithAllocations = {
      ...client,
      allocations: [
        { assetId: 'A001', assetName: 'Ação Petrobras', symbol: 'PETR4', quantity: 100, totalValue: 3550.00 },
        { assetId: 'A003', assetName: 'Tesouro Selic 2029', symbol: 'LFT2029', quantity: 2, totalValue: 29000.00 },
      ]
    };
    // ------------------------------------

    return reply.send(clientWithAllocations); // Enviamos o cliente com as alocações

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ message: 'Erro interno ao buscar cliente.' });
  }
});

  // Rota para ATUALIZAR um cliente existente por ID
  server.put('/:id', {
    schema: { // Define schemas para validação dos parâmetros e do corpo
      params: clientIdParamsSchema,
      body: updateClientBodySchema,
    }
  }, async (request: FastifyRequest<{ Params: ClientIdParams; Body: UpdateClientBody }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;

      const updatedClient = await prisma.client.update({
        where: { id: id },
        data: updateData,
      });
      return reply.send(updatedClient);
    } catch (error: any) {
      if (error.code === 'P2025') { // Código P2025 do Prisma: Registro a ser atualizado não encontrado
        return reply.status(404).send({ message: 'Cliente não encontrado para atualização.' });
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return reply.status(409).send({ message: 'Este email já está cadastrado em outro cliente.' });
      }
      server.log.error(error);
      return reply.status(500).send({ message: 'Erro interno ao atualizar cliente.' });
    }
  });

  // Futuramente, você pode adicionar a rota DELETE aqui também
  // server.delete('/:id', ...)
}