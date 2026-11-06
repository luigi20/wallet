import { Transaction } from '../models/transaction';

export class TransactionViewModel {
  static toHttp(transaction: Transaction) {
    return {
      id: transaction.id,
      sender_wallet_id: transaction.sender_wallet_id,
      receiver_wallet_id: transaction.receiver_wallet_id,
      status: transaction.status,
      amount: transaction.amount,
      created_at: transaction.created_at ? transaction.created_at : null,
      updated_at: transaction.updated_at ? transaction.updated_at : null,
    };
  }
}
