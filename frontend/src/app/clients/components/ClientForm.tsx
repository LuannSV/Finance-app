// frontend/src/app/clients/components/ClientForm.tsx
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import apiClient from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome precisa ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Formato de email inválido." }),
  status: z.enum(['active', 'inactive']),
});

type ClientFormValues = z.infer<typeof formSchema>;

interface ClientData {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
}

interface ClientFormProps {
  onFormSubmit: () => void;
  initialData?: ClientData | null;
}

// Funções de API (sem alterações aqui)
async function createClient(newClient: ClientFormValues) {
  const { data } = await apiClient.post('/clients', newClient);
  return data;
}

async function updateClient({ id, ...updateData }: { id: number } & Partial<ClientFormValues>) {
  const { data } = await apiClient.put(`/clients/${id}`, updateData);
  return data;
}

export function ClientForm({ onFormSubmit, initialData }: ClientFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      status: initialData?.status || "active",
    },
  });

  // CORREÇÃO: Criamos duas mutações separadas
  
  // Mutação para CRIAR
  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onFormSubmit();
    },
    onError: (error: any) => {
      alert(`Erro ao criar cliente: ${error.response?.data?.message || error.message}`);
    }
  });

  // Mutação para ATUALIZAR
  const updateMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      onFormSubmit();
    },
    onError: (error: any) => {
      alert(`Erro ao atualizar cliente: ${error.response?.data?.message || error.message}`);
    }
  });

  // Função onSubmit agora decide qual mutação chamar
  function onSubmit(values: ClientFormValues) {
    if (initialData?.id) { // Se temos um ID, estamos editando
      updateMutation.mutate({ id: initialData.id, ...values });
    } else { // Senão, estamos criando
      createMutation.mutate(values);
    }
  }

  const isEditing = !!initialData;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do Cliente" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Cliente')}
        </Button>
      </form>
    </Form>
  );
}