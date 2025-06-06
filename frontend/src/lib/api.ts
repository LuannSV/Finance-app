// frontend/src/lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  // A URL base da sua API backend que está rodando via Docker.
  // Como o backend está com a porta 3001 mapeada para o seu localhost, podemos usar isso.
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;