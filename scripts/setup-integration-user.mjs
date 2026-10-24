import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function loadEnvFile(path) {
  if (!fs.existsSync(path)) throw new Error(`Arquivo ${path} não encontrado`);
  for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

loadEnvFile('.env.test');
const status = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8' }));
const apiUrl = status.API_URL;
const serviceRoleKey = status.SERVICE_ROLE_KEY;
const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' };

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { ...headers, ...(options.headers ?? {}) } });
  const body = await response.text();
  if (!response.ok && response.status !== 409) throw new Error(`Supabase setup falhou (${response.status})`);
  return body ? JSON.parse(body) : null;
}

const users = await request('/auth/v1/admin/users?per_page=1000');
let user = users.users.find((candidate) => candidate.email === process.env.SUPABASE_TEST_EMAIL);
if (!user) {
  user = await request('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email: process.env.SUPABASE_TEST_EMAIL, password: process.env.SUPABASE_TEST_PASSWORD, email_confirm: true }),
  });
}

await request('/rest/v1/oficina_autorizados?on_conflict=user_id', {
  method: 'POST',
  headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify({ user_id: user.id, ativo: true }),
});
console.log('Usuário de integração local criado/encontrado e autorizado.');
