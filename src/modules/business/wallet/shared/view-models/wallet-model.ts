import { Wallet } from '../models/wallet';

export class WalletViewModel {
  static toHttp(wallet: Wallet) {
    return {
      id: wallet.id,
      status: wallet.user_id,
      balance: wallet.balance,
      created_at: wallet.created_at ? wallet.created_at : null,
      updated_at: wallet.updated_at ? wallet.updated_at : null,
    };
  }
}
