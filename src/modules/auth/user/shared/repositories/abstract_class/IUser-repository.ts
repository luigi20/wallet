import { User } from '../../models/user';

abstract class IUserRepository {
  abstract create(data: User): Promise<void>;
  abstract update_last_login_at(id: string, last_login_at: Date): Promise<void>;
  abstract set_password_hash(id: string, password_hash: string): Promise<void>;
  abstract find_by_email(email: string): Promise<User | null>;
  abstract find_by_id(id: string): Promise<User | null>;
  abstract find_by_id_select_id(id: string): Promise<string | null>;
  abstract set_update_mfa_required(
    id: string,
    mfa_required: boolean,
  ): Promise<void>;
  abstract update(data: User): Promise<void>;
}
export { IUserRepository };
