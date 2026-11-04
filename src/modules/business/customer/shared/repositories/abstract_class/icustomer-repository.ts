import { Prisma } from '@prisma/client';
import { Customer } from '../../models/customer';

abstract class ICustomerRepository {
  abstract create(data: Customer, tx?: Prisma.TransactionClient): Promise<void>;
  abstract update(data: Customer, tx?: Prisma.TransactionClient): Promise<void>;
  abstract find_profile_id(profile_id: string): Promise<Customer | null>;
  abstract find_one(id: string): Promise<Customer | null>;
  abstract find_all(): Promise<string[]>;
}
export { ICustomerRepository };
