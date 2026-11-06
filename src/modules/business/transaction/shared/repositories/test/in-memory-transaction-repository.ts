import { Injectable } from '@nestjs/common';
import { ITransactionRepository } from '../abstract_class/ITransaction-repository';
import { Transaction } from '../../models/transaction';

@Injectable()
class InMemoryTransactionRepository implements ITransactionRepository {
  public list_transactions: Transaction[] = [];

  async create(data: Transaction): Promise<void> {
    this.list_transactions.push(data);
  }

  async find_by_wallet_id(wallet_id: string): Promise<Transaction[]> {
    const transactions = this.list_transactions.filter(
      (item) =>
        item.receiver_wallet_id === wallet_id ||
        item.sender_wallet_id === wallet_id,
    );
    return transactions.sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime(),
    );
  }
  async update_status_conditional(
    id: string,
    current_status: string,
    new_status: string,
  ): Promise<Transaction> {
    const transaction = this.list_transactions.find((item) => item.id === id);
    if (!transaction) return null;
    if (transaction.status !== current_status) return null;
    transaction.status = new_status;
    return transaction;
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
