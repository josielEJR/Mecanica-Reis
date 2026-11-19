import { expect, test } from '@playwright/test';

const email = process.env.SUPABASE_TEST_EMAIL;
const password = process.env.SUPABASE_TEST_PASSWORD;

test.beforeAll(() => {
  if (!email || !password) throw new Error('Defina SUPABASE_TEST_EMAIL e SUPABASE_TEST_PASSWORD em .env.test para executar os testes E2E.');
});

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email!);
  await page.getByLabel('Senha').fill(password!);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Acompanhe a operação da oficina.')).toBeVisible();
}

test('login, sessão persistente e logout protegem as rotas', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email!);
  await page.getByLabel('Senha').fill('senha-incorreta-e2e');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('E-mail ou senha inválidos.')).toBeVisible();

  await login(page);
  await page.reload();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/financeiro');
  await expect(page).toHaveURL(/\/login$/);
});

test('navega por clientes, valida veículo obrigatório e acessa catálogo', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Clientes' }).first().click();
  await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
  await page.getByRole('button', { name: /Novo cliente/ }).click();
  await expect(page.getByRole('heading', { name: 'Novo cliente' })).toBeVisible();
  await page.getByLabel('Nome *').fill(`E2E validação ${Date.now()}`);
  await page.getByRole('button', { name: 'Salvar cliente e veículo' }).click();
  await expect(page.getByRole('heading', { name: 'Novo cliente' })).toBeVisible();
  expect(await page.getByLabel('Marca *').evaluate((field) => !(field as HTMLInputElement).checkValidity())).toBe(true);
  expect(await page.getByLabel('Modelo *').evaluate((field) => !(field as HTMLInputElement).checkValidity())).toBe(true);
  await page.getByRole('button', { name: 'Fechar' }).click();
  await page.getByRole('link', { name: 'Catálogo' }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible();
});

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`não possui rolagem horizontal em ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await login(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
