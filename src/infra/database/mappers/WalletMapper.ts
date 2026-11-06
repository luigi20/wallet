import { Wallet } from '@modules/business/wallet/shared/models/wallet';
import { Wallet as PrismaWallet } from '@prisma/client';
export class WalletMapper {
  static toPrisma(wallet: Wallet) {
    return {
      id: wallet.id,
      user_id: wallet.user_id,
      balance: wallet.balance,
      created_at: wallet.created_at,
      updated_at: wallet.updated_at,
    };
  }

  static toDomain(raw: PrismaWallet): Wallet {
    return new Wallet(
      {
        user_id: raw.user_id,
        balance: raw.balance.toNumber(),
        created_at: raw.created_at,
        updated_at: raw.updated_at,
      },
      raw.id,
    );
  }
}
