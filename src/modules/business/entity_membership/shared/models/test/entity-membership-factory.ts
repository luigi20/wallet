import { randomUUID } from 'crypto';
import {
  Entity_Membership,
  Entity_Membership_Props,
} from '../entity_membership';

type Override = Partial<Entity_Membership_Props>;
type FactoryParams = {
  id?: string;
  props?: Override;
};
export function makeEntityMembership({ id, props }: FactoryParams = {}) {
  return new Entity_Membership({
    entity_id: randomUUID(),
    profile_id: randomUUID(),
    created_at: new Date(),
    roles: ['barbeiro'],
    status: 'ativo',
    updated_at: new Date(),
    ...props,
  });
}
