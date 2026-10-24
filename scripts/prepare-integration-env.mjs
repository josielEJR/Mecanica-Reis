import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const status = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8' }));
const contents = [
  `SUPABASE_URL=${status.API_URL}`,
  `SUPABASE_ANON_KEY=${status.ANON_KEY}`,
  'SUPABASE_TEST_EMAIL=mecanica-reis.integration@example.test',
  'SUPABASE_TEST_PASSWORD=Mecanica-Reis-Integration-2026!',
  '',
].join('\n');
fs.writeFileSync('.env.test', contents, { mode: 0o600 });
console.log('Variáveis locais de integração gravadas em .env.test (arquivo ignorado pelo Git).');
