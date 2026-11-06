import { Wallet } from '../wallet';
import { randomUUID } from 'crypto';

describe('Create Wallet', () => {
  it('should be able to create a Wallet', () => {
    const wallet = new Wallet({
      balance: 100.5,
      user_id: randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    expect(wallet).toBeTruthy();
  });
});
