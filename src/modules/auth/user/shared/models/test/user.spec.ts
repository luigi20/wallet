import { User } from '../user';

describe('Create User', () => {
  it('should be able to create a User', () => {
    const user = new User({
      mfa_required: false,
      email: 'pedro@hotmail.com',
      status: 'ativo',
      name: 'Pedro',
      created_at: new Date(),
      updated_at: new Date(),
      last_login_at: new Date(),
      document: '12345678900',
    });
    expect(user).toBeTruthy();
  });
});
