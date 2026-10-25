import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/integration/setup.ts'],
    // Os testes de integração compartilham o Supabase local e usuários de teste;
    // executá-los em paralelo causa sessões concorrentes e falsos AuthRetryableFetchError.
    fileParallelism: false,
  },
});
