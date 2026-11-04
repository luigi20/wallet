import { Injectable } from '@nestjs/common';
import { Password_Reset_Tokens } from '../../models/password-reset-tokens';
import { IPasswordResetTokensRepository } from '../abstract_class/ipassword-reset-tokens-repository';

@Injectable()
export class InMemoryPasswordResetTokensRepository implements IPasswordResetTokensRepository {
  public list_password_reset_tokens: Password_Reset_Tokens[] = [];

  async create(data: Password_Reset_Tokens): Promise<void> {
    this.list_password_reset_tokens.push(data);
  }

  async find_one(
    user_id: string,
    used: boolean,
    now: Date,
  ): Promise<Password_Reset_Tokens | null> {
    const password_reset_tokens = this.list_password_reset_tokens.find(
      (item) =>
        item.user_id === user_id &&
        item.used_at === used &&
        item.expires_at > now,
    );
    if (!password_reset_tokens) return null;
    return password_reset_tokens;
  }

  async update_used(id: string): Promise<void> {
    const index = this.list_password_reset_tokens.findIndex(
      (item) => item.id === id,
    );
    if (index >= 0) {
      this.list_password_reset_tokens[index].used_at = true;
    }
  }
}
