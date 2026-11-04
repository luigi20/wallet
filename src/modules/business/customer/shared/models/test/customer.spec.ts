import { randomUUID } from 'crypto';
import { Customer } from '../customer';

describe('Create customer', () => {
  it('should be able to create a customer', () => {
    const customer = new Customer({
      profile_id: randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    expect(customer).toBeTruthy();
  });
});
