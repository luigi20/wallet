import { randomUUID } from 'crypto';
import { Refresh_Tokens } from '../refresh-tokens';

type Override = Partial<Refresh_Tokens>;
type FactoryParams = {
  id?: string;
  props?: Override;
};
export function makeRefreshTokens({ id, props }: FactoryParams = {}) {
  return new Refresh_Tokens(
    {
      user_id: randomUUID(),
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      token_hash:
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$7sH1QxYk6dJ6z9K8Yf5rW1qK9VwV8bTz1CkGm3nQp9I',
      revoked_at: true,
      ...props,
    },
    id,
  );
}
