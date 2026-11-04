import { Injectable } from '@nestjs/common';
import { Refresh_Tokens } from '../../models/refresh-tokens';
import { IRefreshTokensRepository } from '../abstract_class/irefresh-tokens-repository';

@Injectable()
export class InMemoryRefreshTokensRepository implements IRefreshTokensRepository {
  public list_refresh_tokens: Refresh_Tokens[] = [];

  async create(data: Refresh_Tokens): Promise<void> {
    this.list_refresh_tokens.push(data);
  }

  async find_one(
    id: string,
    revoked: boolean,
    now: Date,
  ): Promise<Refresh_Tokens | null> {
    const refresh_tokens = this.list_refresh_tokens.find(
      (item) =>
        item.id === id && item.revoked_at === revoked && item.expires_at > now,
    );
    if (!refresh_tokens) return null;
    return refresh_tokens;
  }

  async find_by_hash(token_hash: string): Promise<string | null> {
    const refresh_tokens = this.list_refresh_tokens.find(
      (item) => item.token_hash === token_hash,
    );
    if (!refresh_tokens) return null;
    return refresh_tokens.id;
  }

  async update_revoked(id: string): Promise<void> {
    const index = this.list_refresh_tokens.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.list_refresh_tokens[index].revoked_at = true;
    }
  }
}
