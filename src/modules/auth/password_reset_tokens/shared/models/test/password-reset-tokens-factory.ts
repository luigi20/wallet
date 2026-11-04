import { randomUUID } from 'crypto';
import {
  Password_Reset_Tokens,
  Password_Reset_Tokens_Props,
} from '../password-reset-tokens';

type Override = Partial<Password_Reset_Tokens_Props>;
type FactoryParams = {
  id?: string;
  props?: Override;
};
export function makePasswordResetTokens({ id, props }: FactoryParams = {}) {
  return new Password_Reset_Tokens(
    {
      user_id: randomUUID(),
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      token_hash: 'mnfdjfdfdfe',
      used_at: true,
      ...props,
    },
    id,
  );
}
