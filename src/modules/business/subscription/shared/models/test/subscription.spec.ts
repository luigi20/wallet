import { randomUUID } from 'crypto';
import { Subscription } from '../subscription';

describe('Create subscription', () => {
  it('should be able to create a subscription', () => {
    const subscription = new Subscription({
      entity_id: randomUUID(),
      plan_id: randomUUID(),
      started_at: new Date(),
      status: 'ativo',
    });
    expect(subscription).toBeTruthy();
  });
});
