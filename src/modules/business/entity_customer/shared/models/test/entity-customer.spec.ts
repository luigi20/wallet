import { randomUUID } from 'crypto';
import { Entity_Customer } from '../entity_customer';

describe('Create entity customer', () => {
  it('should be able to create a entity customer', () => {
    const entity_customer = new Entity_Customer({
      entity_id: randomUUID(),
      customer_id: randomUUID(),
      created_at: new Date(),
      notes: 'role',
      status: 'ativo',
      updated_at: new Date(),
    });
    expect(entity_customer).toBeTruthy();
  });
});
