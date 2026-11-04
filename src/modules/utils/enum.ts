export enum EntityType {
  BARBEARIA = 'barbearia',
  STUDIO = 'studio',
}

export enum EntityStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  BLOQUEADO = 'bloqueado',
  PENDENTE = 'pendente',
}

export enum CustomerStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  BLOQUEADO = 'bloqueado',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum IdentityStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  BLOQUEADO = 'bloqueado',
}

export enum MemberRole {
  ADMINISTRADOR = 'administrador',
  INVESTIDOR = 'investidor',
}

export enum MembershipStatus {
  ATIVO = 'ativo',
  CONVIDADO = 'convidado',
  INATIVO = 'inativo',
}

export enum TokenType {
  LOGIN = 'login',
  MFA = 'mfa',
  ACCESS = 'access',
  CHALLENGE = 'challenge',
  REFRESH = 'refresh',
}
