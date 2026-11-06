import { Injectable } from '@nestjs/common';
import { IWalletRepository } from '../abstract_class/IWallet-repository';
import { Wallet } from '../../models/wallet';

@Injectable()
class InMemoryWalletRepository implements IWalletRepository {
  async update(data: Wallet): Promise<void> {
    const index = this.list_wallets.findIndex((item) => item.id === data.id);
    if (index >= 0) {
      this.list_wallets[index] = data;
    }
  }

  async find_by_id(id: string): Promise<Wallet | null> {
    const wallet = this.list_wallets.find((item) => item.id === id);
    if (!wallet) return null;
    return wallet;
  }

  async find_by_user_id(user_id: string): Promise<Wallet | null> {
    const wallet = this.list_wallets.find((item) => item.user_id === user_id);
    if (!wallet) return null;
    return wallet;
  }

  public list_wallets: Wallet[] = [];

  async create(data: Wallet): Promise<void> {
    this.list_wallets.push(data);
  }
}
export { InMemoryWalletRepository };
