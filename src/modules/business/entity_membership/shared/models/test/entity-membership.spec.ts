import { randomUUID } from 'crypto';
import { Entity_Membership } from '../entity_membership';

describe('Create membership', () => {
  it('should be able to create a entity membership', () => {
    const entity_membership = new Entity_Membership({
      entity_id: randomUUID(),
      profile_id: randomUUID(),
      created_at: new Date(),
      roles: ['barbeiro'],
      status: 'ativo',
      updated_at: new Date(),
    });
    expect(entity_membership).toBeTruthy();
  });
});
