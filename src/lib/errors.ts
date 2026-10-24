export type DomainErrorCode = 'NOT_FOUND' | 'VALIDATION' | 'UNAUTHORIZED' | 'CONFLICT' | 'INTEGRITY' | 'INVALID_STATE';

export class DomainError extends Error {
  constructor(public readonly code: DomainErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DomainError';
  }
}

export function mapSupabaseError(error: { code?: string; message?: string } | null): DomainError {
  const code = error?.code;
  if (code === '42501') return new DomainError('UNAUTHORIZED', 'Acesso não autorizado');
  if (code === '23505') return new DomainError('CONFLICT', 'Registro duplicado', { cause: error });
  if (code === 'P0002') return new DomainError('NOT_FOUND', 'Registro não encontrado', { cause: error });
  if (code === 'P0001') return new DomainError('INVALID_STATE', error?.message ?? 'Operação incompatível com o estado atual', { cause: error });
  if (code?.startsWith('23')) return new DomainError('INTEGRITY', 'Operação rejeitada pela integridade do banco', { cause: error });
  return new DomainError('INTEGRITY', 'Falha ao acessar os dados', { cause: error });
}
