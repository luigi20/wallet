import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasswordResetController } from './password_reset/controller/password_reset.controller';
import { PasswordResetRequestController } from './password_reset_request/controller/password_reset_request.controller';
import { ValidateMFAController } from './validate_mfa/controller/validate-mfa.controller';
import { PasswordResetRequestService } from './password_reset_request/service/password_reset_request.service';
import { PasswordResetService } from './password_reset/service/password_reset.service';
import { ValidateMFAService } from './validate_mfa/services/validate-MFA-service';
import { RefreshTokenController } from './refresh_token/controller/refresh-token.controller';
import { LogoutController } from './logout/controller/logout.controller';
import { LogoutService } from './logout/service/logout.service';
import { IUserRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { UserRepository } from '@modules/auth/user/shared/repositories/user-repository';
import { IMFACodeRepository } from '@modules/auth/mfa/shared/repositories/abstract_class/imfa-code-repository';
import { MFACodeRepository } from '@modules/auth/mfa/shared/repositories/mfa-code-repository';
import { IPasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/abstract_class/ipassword-reset-tokens-repository';
import { PasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/password-reset-tokens-repository';
import { IRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/abstract_class/irefresh-tokens-repository';
import { RefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/refresh-tokens-repository';
import { RefreshTokenService } from './refresh_token/service/refresh-token.service';
import { MFAConfirmController } from './mfa_confirm/controller/mfa_confirm.controller';
import { MFAConfirmService } from './mfa_confirm/service/mfa_confirm.service';
import { IEmailService } from 'infra/email/abstract class/IEmailService';
import { ResendEmailService } from 'infra/email/services/resend_email_service';
import { SignInController } from './signin/controller/signin.controller';
import { SignUpController } from './signup/controller/signup.controller';
import { SignUpService } from './signup/service/signup.service';
import { SignInService } from './signin/service/signin.service';
import { GenerateMFAService } from './signin/service/generate-mfa.service';
import { IWalletRepository } from '@modules/business/wallet/shared/repositories/abstract_class/IWallet-repository';
import { WalletRepository } from '@modules/business/wallet/shared/repositories/wallet-repository';
import { JwtAuthGuard } from '../guards/jwt_auth_guard';

@Module({
  imports: [
    JwtModule.register({
      privateKey: process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      publicKey: process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [
    PasswordResetController,
    PasswordResetRequestController,
    SignUpController,
    SignInController,
    ValidateMFAController,
    RefreshTokenController,
    LogoutController,
    MFAConfirmController,
  ],
  providers: [
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IEmailService,
      useClass: ResendEmailService,
    },
    {
      provide: IMFACodeRepository,
      useClass: MFACodeRepository,
    },
    {
      provide: IPasswordResetTokensRepository,
      useClass: PasswordResetTokensRepository,
    },
    {
      provide: IRefreshTokensRepository,
      useClass: RefreshTokensRepository,
    },
    {
      provide: IWalletRepository,
      useClass: WalletRepository,
    },
    JwtAuthGuard,
    PasswordResetService,
    PasswordResetRequestService,
    SignUpService,
    SignInService,
    ValidateMFAService,
    RefreshTokenService,
    LogoutService,
    MFAConfirmService,
    GenerateMFAService,
  ],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
