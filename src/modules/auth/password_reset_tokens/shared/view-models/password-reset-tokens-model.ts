import { Password_Reset_Tokens } from '../models/password-reset-tokens';

export class PasswordResetTokenViewModel {
  static toHttp(password_reset_tokens: Password_Reset_Tokens) {
    return {
      id: password_reset_tokens.id,
      user_id: password_reset_tokens.user_id,
      token_hash: password_reset_tokens.token_hash,
      used_at: password_reset_tokens.used_at,
      expires_at: password_reset_tokens.expires_at,
    };
  }
}
