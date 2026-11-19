import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist-web');
const manifestPath = path.join(root, 'manifest.webmanifest');
if (!fs.existsSync(root) || !fs.existsSync(manifestPath)) {
  console.error('Build web ausente. Execute npm run web:build antes desta verificação.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const required = ['name', 'short_name', 'start_url', 'scope', 'display', 'theme_color', 'background_color', 'icons'];
const missing = required.filter((key) => !(key in manifest));
if (missing.length || manifest.display !== 'standalone') {
  console.error(`Manifesto PWA inválido: ${[...missing, manifest.display !== 'standalone' ? 'display=standalone' : ''].filter(Boolean).join(', ')}`);
  process.exit(1);
}
for (const icon of manifest.icons) {
  const iconPath = path.join(root, icon.src.replace(/^\//, ''));
  if (!fs.existsSync(iconPath)) {
    console.error(`Ícone ausente no build: ${icon.src}`);
    process.exit(1);
  }
}

// Bibliotecas do navegador podem conter exemplos genéricos como "localhost" e
// "sb_secret_". Verifique somente URLs locais efetivamente configuradas e nomes
// de credenciais privadas, evitando falsos positivos do bundle minificado.
const forbidden = /(?:https?:\/\/(?:127\.0\.0\.1|localhost):(?:54321|4173|4174)|SUPABASE_SERVICE_ROLE_KEY\s*=|SERVICE_ROLE_KEY\s*=)/i;
const files = [];
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(full);
    else if (/\.(?:js|css|html|webmanifest|json)$/.test(entry.name)) files.push(full);
  }
}
visit(root);
const unsafe = files.filter((file) => forbidden.test(fs.readFileSync(file, 'utf8')));
if (unsafe.length) {
  console.error(`Referências locais ou segredos encontradas no bundle: ${unsafe.join(', ')}`);
  process.exit(1);
}
console.log(`Bundle de produção verificado: ${files.length} arquivos, sem URLs locais ou credenciais privadas.`);
