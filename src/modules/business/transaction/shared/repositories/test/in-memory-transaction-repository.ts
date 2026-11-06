import { Injectable } from '@nestjs/common';
import { ITransactionRepository } from '../abstract_class/ITransaction-repository';
import { Transaction } from '../../models/transaction';

@Injectable()
class InMemoryTransactionRepository implements ITransactionRepository {
  public list_transactions: Transaction[] = [];

  async create(data: Transaction): Promise<void> {
    this.list_transactions.push(data);
  }

  async update(data: Transaction): Promise<void> {
    const index = this.list_transactions.findIndex(
      (item) => item.id === data.id,
    );
    if (index >= 0) {
      this.list_transactions[index] = data;
    }
  }

  async find_by_id(id: string): Promise<Transaction | null> {
    const transaction = this.list_transactions.find((item) => item.id === id);
    if (!transaction) return null;
    return transaction;
  }
}
export { InMemoryTransactionRepository };
