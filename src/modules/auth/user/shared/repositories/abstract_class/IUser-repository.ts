import { Prisma } from '@prisma/client';
import { User } from '../../models/user';

abstract class IUserRepository {
  abstract create(data: User, tx?: Prisma.TransactionClient): Promise<void>;
  abstract update_last_login_at(id: string, last_login_at: Date): Promise<void>;
  abstract find_by_email(email: string): Promise<User | null>;
  abstract find_by_id(id: string): Promise<User | null>;
  abstract set_update_mfa_required(
    id: string,
    mfa_required: boolean,
  ): Promise<void>;
  abstract update(data: User, tx?: Prisma.TransactionClient): Promise<void>;
}
export { IUserRepository };
