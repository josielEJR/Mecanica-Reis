import type { AppSupabaseClient } from '../lib/supabase.js';
import { DomainError, mapSupabaseError } from '../lib/errors.js';
export class AuthService {
  constructor(private readonly db: AppSupabaseClient) {}
  async entrar(email: string, senha: string) { const { data, error } = await this.db.auth.signInWithPassword({ email, password: senha }); if (error) throw new DomainError('UNAUTHORIZED', 'Falha ao entrar'); return data.session; }
  async sair() { const { error } = await this.db.auth.signOut(); if (error) throw mapSupabaseError(error); }
  async obterSessao() { const { data, error } = await this.db.auth.getSession(); if (error) throw mapSupabaseError(error); return data.session; }
  async obterUsuarioAtual() { const { data, error } = await this.db.auth.getUser(); if (error) throw new DomainError('UNAUTHORIZED', 'Sessão inválida'); return data.user; }
  async verificarAutorizacao(): Promise<boolean> { await this.obterUsuarioAtual(); const { data, error } = await this.db.rpc('usuario_autorizado'); if (error) throw mapSupabaseError(error); return data === true; }
}
