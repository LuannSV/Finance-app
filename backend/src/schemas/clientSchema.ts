// backend/src/schemas/clientSchema.ts
import { z } from 'zod';

export const createClientBodySchema = z.object({
  name: z.string().min(3, { message: "O nome do cliente precisa ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Formato de email inválido." }),
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: "Status deve ser 'active' ou 'inactive'." })
  }),
});
// Tipo inferido a partir do schema para uso no TypeScript
export type CreateClientBody = z.infer<typeof createClientBodySchema>; // <--- CORRIGIDO

export const updateClientBodySchema = createClientBodySchema.partial();
export type UpdateClientBody = z.infer<typeof updateClientBodySchema>; // <--- CORRIGIDO

export const clientIdParamsSchema = z.object({
  id: z.string().refine(val => !isNaN(parseInt(val, 10)), {
    message: "O ID do cliente na URL deve ser um número.",
  }).transform(val => parseInt(val, 10)),
});
export type ClientIdParams = z.infer<typeof clientIdParamsSchema>; // <--- CORRIGIDO