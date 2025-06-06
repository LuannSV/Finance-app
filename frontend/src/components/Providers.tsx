'use client'; // Este componente deve rodar no cliente (navegador)

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Cria uma única instância do QueryClient para evitar recriações a cada renderização
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* A linha abaixo adiciona as ferramentas de dev do React Query (opcional mas útil) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}