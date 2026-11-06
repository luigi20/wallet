import { Password_Reset_Tokens } from '@modules/auth/password_reset_tokens/shared/models/password-reset-tokens';

abstract class IPasswordResetTokensRepository {
  abstract create(data: Password_Reset_Tokens): Promise<void>;
  abstract find_one(
    user_id: string,
    used: boolean,
    now: Date,
  ): Promise<Password_Reset_Tokens | null>;
  abstract find_valid(
    user_id: string,
    now: Date,
  ): Promise<Password_Reset_Tokens[]>;
  abstract update_used(id: string): Promise<void>;
}
export { IPasswordResetTokensRepository };
