import { Refresh_Tokens } from '@modules/auth/refresh_token/shared/models/refresh-tokens';
import { RefreshToken as PrismaRefreshTokens } from '@prisma/client';
export class RefreshTokensMapper {
  static toPrisma(refresh_token: Refresh_Tokens) {
    return {
      id: refresh_token.id,
      user_id: refresh_token.user_id,
      token_hash: refresh_token.token_hash,
      expires_at: refresh_token.expires_at,
      revoked_at: refresh_token.revoked_at,
      created_at: refresh_token.created_at,
      updated_at: refresh_token.updated_at,
    };
  }

  static toDomain(raw: PrismaRefreshTokens): Refresh_Tokens {
    return new Refresh_Tokens(
      {
        user_id: raw.user_id,
        token_hash: raw.token_hash,
        expires_at: raw.expires_at,
        revoked_at: raw.revoked_at,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
      },
      raw.id,
    );
  }
}
