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
import { GetWalletController } from './wallet/get_wallet/controller/wallet_get.controller';
import { GetWalletService } from './wallet/get_wallet/services/wallet_get.service';
import { GetTransactionHistoryService } from './transaction/get_transaction_history/services/get_transaction_history.service';
import { GetTransactionHistoryController } from './transaction/get_transaction_history/controller/get_transaction_history.controller';
import { CreateDepositController } from './wallet/deposit/controller/create_deposit.controller';
import { CreateDepositService } from './wallet/deposit/services/create_deposit.services';

@Module({
  imports: [AuthModule],
  controllers: [
    TransactionCreateController,
    TransactionReversalController,
    GetWalletController,
    GetTransactionHistoryController,
    CreateDepositController,
  ],
  providers: [
    TransactionCreateService,
    TransactionReversalService,
    GetWalletService,
    GetTransactionHistoryService,
    CreateDepositService,
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
