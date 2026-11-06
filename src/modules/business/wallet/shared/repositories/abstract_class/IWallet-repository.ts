import { Wallet } from '../../models/wallet';

abstract class IWalletRepository {
  abstract create(data: Wallet): Promise<void>;
  abstract find_by_id(id: string): Promise<Wallet | null>;
  abstract find_by_user_id(user_id: string): Promise<Wallet | null>;
  abstract update(data: Wallet): Promise<void>;
}
export { IWalletRepository };
