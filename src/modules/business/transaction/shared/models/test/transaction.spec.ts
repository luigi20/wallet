import { randomUUID } from 'crypto';
import { Transaction } from '../transaction';

describe('Create Transaction', () => {
  it('should be able to create a Transaction', () => {
    const transaction = new Transaction({
      amount: 100.5,
      sender_wallet_id: randomUUID(),
      receiver_wallet_id: randomUUID(),
      status: 'completed',
      created_at: new Date(),
      updated_at: new Date(),
    });
    expect(transaction).toBeTruthy();
  });
});
