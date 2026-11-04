import { Identity } from '../models/user';

export class IdentityViewModel {
  static toHttp(identity: Identity) {
    return {
      id: identity.id,
      status: identity.status,
      email: identity.email,
      last_login_at: identity.last_login_at ? identity.last_login_at : null,
      created_at: identity.created_at ? identity.created_at : null,
      updated_at: identity.updated_at ? identity.updated_at : null,
    };
  }
}
