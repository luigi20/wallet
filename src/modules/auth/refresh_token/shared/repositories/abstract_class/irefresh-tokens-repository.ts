import { Refresh_Tokens } from '../../models/refresh-tokens';

abstract class IRefreshTokensRepository {
  abstract create(data: Refresh_Tokens): Promise<void>;
  abstract find_by_hash(token_hash: string): Promise<string | null>;
  abstract find_active_by_hash(
    token_hash: string,
    now: Date,
  ): Promise<Refresh_Tokens | null>;
  abstract find_one(
    user_id: string,
    revoked: boolean,
    now: Date,
  ): Promise<Refresh_Tokens | null>;
  abstract update_revoked(id: string): Promise<void>;
}
export { IRefreshTokensRepository };
