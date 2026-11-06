import { Module } from '@nestjs/common';
import { ITransactionRepository } from '../transaction/shared/repositories/abstract_class/ITransaction-repository';
import { TransactionRepository } from '../transaction/shared/repositories/transaction-repository';
import { IWalletRepository } from '../wallet/shared/repositories/abstract_class/IWallet-repository';
import { WalletRepository } from '../wallet/shared/repositories/wallet-repository';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { UserRepository } from '@modules/auth/user/shared/repositories/user-repository';
import { TransactionCreateController } from './transaction/create/controller/transaction.controller';
import { TransactionReversalController } from './transaction/reversal/controller/transaction_reversal.controller';
import { TransactionCreateService } from './transaction/create/services/transaction_create.service';
import { TransactionReversalService } from './transaction/reversal/services/transaction_reversal.service';
import { AuthModule } from '@modules/auth/use_cases/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TransactionCreateController, TransactionReversalController],
  providers: [
    TransactionCreateService,
    TransactionReversalService,
    {
      provide: ITransactionRepository,
      useClass: TransactionRepository,
    },
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IWalletRepository,
      useClass: WalletRepository,
    },
  ],
  exports: [],
})
export class BusinessModule {}
