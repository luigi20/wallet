import { Plan } from '../plan';

describe('Create Plan', () => {
  it('should be able to create a plan', () => {
    const plan = new Plan({
      active: true,
      name: 'free',
      price: 0,
    });
    expect(plan).toBeTruthy();
  });
});
