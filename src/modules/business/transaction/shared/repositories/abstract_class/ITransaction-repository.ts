import { Prisma } from '@prisma/client';
import { Transaction } from '../../models/transaction';

abstract class ITransactionRepository {
  abstract create(data: Transaction): Promise<void>;
  abstract update(data: Transaction): Promise<void>;
  abstract find_by_id(id: string): Promise<Transaction | null>;
  abstract find_by_wallet_id(wallet_id: string): Promise<Transaction[]>;
  abstract update_status_conditional(
    id: string,
    current_status: string,
    new_status: string,
  ): Promise<Transaction>;
}
export { ITransactionRepository };
