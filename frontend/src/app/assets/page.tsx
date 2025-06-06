// frontend/src/app/assets/page.tsx
'use client';

import apiClient from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Usando o Card do ShadCN

interface Asset {
  id: string;
  name: string;
  symbol: string;
  value: number;
}

async function fetchAssets(): Promise<Asset[]> {
  const { data } = await apiClient.get('/assets');
  return data;
}

export default function AssetsPage() {
  const { data: assets, isLoading, isError, error } = useQuery<Asset[], Error>({
    queryKey: ['assets'],
    queryFn: fetchAssets,
  });

  if (isLoading) {
    return <div className="container mx-auto p-10">Carregando ativos...</div>;
  }

  if (isError) {
    return <div className="container mx-auto p-10">Erro ao carregar ativos: {error.message}</div>;
  }

  return (
    <main className="container mx-auto p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ativos Financeiros</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets?.map((asset) => (
          <Card key={asset.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{asset.name}</span>
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {asset.symbol}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                R$ {asset.value.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-sm text-muted-foreground">Valor Atual</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}