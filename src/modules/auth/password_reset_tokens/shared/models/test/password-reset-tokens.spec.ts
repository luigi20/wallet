import { randomUUID } from 'crypto';
import { Password_Reset_Tokens } from '../password-reset-tokens';

describe('Create Password Reset Tokens', () => {
  it('should be able to create a Password Reset Tokens', () => {
    const password_reset_tokens = new Password_Reset_Tokens({
      user_id: randomUUID(),
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      token_hash: 'mnfdjfdfdfe',
      used_at: true,
    });
    expect(password_reset_tokens).toBeTruthy();
  });
});
