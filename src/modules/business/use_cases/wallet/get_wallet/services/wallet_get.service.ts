import { Injectable } from '@nestjs/common';
import { IWalletRepository } from '../../../../wallet/shared/repositories/abstract_class/IWallet-repository';
import { AppError } from '@modules/utils/app_error';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { Get_Balance } from '@modules/utils/types';

@Injectable()
export class GetWalletService {
  constructor(
    private wallet_repository: IWalletRepository,
    private user_repository: IUserRepository,
  ) {}

  async execute(user_id: string): Promise<Get_Balance> {
    const user = await this.user_repository.find_by_id(user_id);
    if (!user) throw new AppError('Usuário não encontrado', 404);
    const wallet = await this.wallet_repository.find_by_user_id(user_id);
    if (!wallet)
      throw new AppError('Carteira não encontrada para este usuário', 404);
    return {
      name: user.name,
      wallet_id: wallet.id,
      user_id: wallet.user_id,
      balance: wallet.balance,
    };
  }
}
