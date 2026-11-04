import { randomUUID } from 'crypto';
import { MFA_Code } from '../mfa_code';

describe('Create MFA Code', () => {
  it('should be able to create a MFA Code', () => {
    const mfa_code = new MFA_Code({
      user_id: randomUUID(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      code: '4234tuv',
      used_at: false,
      attempts: 0,
      type: 'email',
    });
    expect(mfa_code).toBeTruthy();
  });
});
