import { Password_Reset_Tokens } from '@modules/auth/password_reset_tokens/shared/models/password-reset-tokens';
import { PasswordResetToken as PrismaPasswordResetTokens } from '@prisma/client';
export class PasswordResetTokensMapper {
  static toPrisma(password_reset_tokens: Password_Reset_Tokens) {
    return {
      id: password_reset_tokens.id,
      user_id: password_reset_tokens.user_id,
      token_hash: password_reset_tokens.token_hash,
      expires_at: password_reset_tokens.expires_at,
      used_at: password_reset_tokens.used_at,
      created_at: password_reset_tokens.created_at,
      updated_at: password_reset_tokens.updated_at,
    };
  }

  static toDomain(raw: PrismaPasswordResetTokens): Password_Reset_Tokens {
    return new Password_Reset_Tokens(
      {
        token_hash: raw.token_hash,
        user_id: raw.user_id,
        expires_at: raw.expires_at,
        used_at: raw.used_at,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
      },
      raw.id,
    );
  }
}
