import { User } from '../models/user';

export class UserViewModel {
  static toHttp(user: User) {
    return {
      id: user.id,
      status: user.status,
      email: user.email,
      last_login_at: user.last_login_at ? user.last_login_at : null,
      created_at: user.created_at ? user.created_at : null,
      updated_at: user.updated_at ? user.updated_at : null,
    };
  }
}
