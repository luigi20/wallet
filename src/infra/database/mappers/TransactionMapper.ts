import { Transaction } from '@modules/business/transaction/shared/models/transaction';
import { Transaction as PrismaTransaction } from '@prisma/client';
export class TransactionMapper {
  static toPrisma(transaction: Transaction) {
    return {
      id: transaction.id,
      sender_wallet_id: transaction.sender_wallet_id,
      receiver_wallet_id: transaction.receiver_wallet_id,
      amount: transaction.amount,
      status: transaction.status,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }

  static toDomain(raw: PrismaTransaction): Transaction {
    return new Transaction(
      {
        sender_wallet_id: raw.sender_wallet_id,
        receiver_wallet_id: raw.receiver_wallet_id,
        amount: raw.amount.toNumber(),
        status: raw.status,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
      },
      raw.id,
    );
  }
}
