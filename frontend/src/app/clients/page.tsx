// frontend/src/app/clients/page.tsx
'use client';

// PASSO 3 - Ação 1: Importar o Link
import Link from 'next/link';
import { useState } from 'react';
import apiClient from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClientForm } from './components/ClientForm';

interface Client {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

async function fetchClients(): Promise<Client[]> {
  const { data } = await apiClient.get('/clients');
  return data;
}

export default function ClientsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data: clients, isLoading, isError, error } = useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const handleAddNew = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  if (isLoading) return <div className="container mx-auto p-10">Carregando clientes...</div>;
  if (isError) return <div className="container mx-auto p-10">Erro ao carregar clientes: {error.message}</div>;

  return (
    <main className="container mx-auto p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
        <Button onClick={handleAddNew}>Adicionar Cliente</Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <ClientForm
            onFormSubmit={() => setIsFormOpen(false)}
            initialData={editingClient}
          />
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Uma lista dos seus clientes recentes.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.id}</TableCell>
                
                {/* PASSO 3 - Ação 2: Célula do Nome agora é um Link */}
                <TableCell>
                  <Link href={`/clients/${client.id}`} className="font-medium text-primary hover:underline">
                    {client.name}
                  </Link>
                </TableCell>
                
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {client.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}