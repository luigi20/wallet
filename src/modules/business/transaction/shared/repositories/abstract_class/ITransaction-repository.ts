import { Prisma } from '@prisma/client';
import { Transaction } from '../../models/transaction';

abstract class ITransactionRepository {
  abstract create(data: Transaction): Promise<void>;
  abstract update(data: Transaction): Promise<void>;
  abstract find_by_id(id: string): Promise<Transaction | null>;
}
export { ITransactionRepository };
