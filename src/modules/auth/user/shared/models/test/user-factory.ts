import { IdentityStatus } from '@modules/utils/enum';
import { User, User_Props } from '../user';

type Override = Partial<User_Props>;
type FactoryParams = {
  id?: string;
  props?: Override;
};

export function makeUser({ id, props }: FactoryParams = {}) {
  return new User(
    {
      mfa_required: false,
      email: 'pedro@hotmail.com',
      status: IdentityStatus.ATIVO,
      name: 'Pedro',
      created_at: new Date(),
      updated_at: new Date(),
      last_login_at: new Date(),
      mfa_code: null,
      document: '12345678900',
      ...props,
    },
    id,
  );
}
