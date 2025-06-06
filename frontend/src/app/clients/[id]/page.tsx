// frontend/src/app/clients/[id]/page.tsx
'use client';

import apiClient from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation'; // Hook para pegar o ID da URL
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Tipos para os dados que esperamos
interface Allocation {
  assetId: string;
  assetName: string;
  symbol: string;
  quantity: number;
  totalValue: number;
}

interface ClientDetails {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  allocations: Allocation[]; // O cliente agora tem uma lista de alocações
}

// Função para buscar os dados de um cliente específico
async function fetchClientById(clientId: string): Promise<ClientDetails> {
  const { data } = await apiClient.get(`/clients/${clientId}`);
  return data;
}

export default function ClientDetailPage() {
  const params = useParams(); // Pega os parâmetros da URL, ex: { id: '1' }
  const clientId = params.id as string;

  const { data: client, isLoading, isError, error } = useQuery<ClientDetails, Error>({
    // A chave da query inclui o ID para que cada cliente tenha seu próprio cache
    queryKey: ['client', clientId], 
    queryFn: () => fetchClientById(clientId),
    enabled: !!clientId, // A query só roda se o clientId existir
  });

  if (isLoading) return <div className="container mx-auto p-10">Carregando dados do cliente...</div>;
  if (isError) return <div className="container mx-auto p-10">Erro ao carregar dados: {error.message}</div>;

  // Calcula o total investido somando o valor de todas as alocações
  const totalInvested = client?.allocations.reduce((sum, allocation) => sum + allocation.totalValue, 0) || 0;

  return (
    <main className="container mx-auto p-10">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">{client?.name}</h1>
        <p className="text-muted-foreground">{client?.email}</p>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              R$ {totalInvested.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-sm text-muted-foreground">Valor Total Investido</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Alocação de Ativos</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ativo</TableHead>
              <TableHead>Símbolo</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {client?.allocations.map((alloc) => (
              <TableRow key={alloc.assetId}>
                <TableCell>{alloc.assetName}</TableCell>
                <TableCell>{alloc.symbol}</TableCell>
                <TableCell>{alloc.quantity}</TableCell>
                <TableCell className="text-right">
                  R$ {alloc.totalValue.toFixed(2).replace('.', ',')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}