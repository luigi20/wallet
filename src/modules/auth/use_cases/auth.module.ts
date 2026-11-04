import { Module } from '@nestjs/common';
import { SignUpService } from './signup2/service/signup.service';
import { JwtModule } from '@nestjs/jwt';
import { SignUpController } from './signup2/controllers/signup.controller';
import { SignInController } from './signup/controller/signup.controller';
import { SignInService } from './signup/service/signup.service';
import { GenerateMFAController } from './generate_mfa/controller/generate-mfa.controller';
import { JWKSController } from './jwks/controller/jwks.controller';
import { PasswordResetController } from './password_reset/controller/password_reset.controller';
import { PasswordResetRequestController } from './password_reset_request/controller/password_reset_request.controller';
import { ValidateMFAController } from './validate_mfa/controller/validate-mfa.controller';
import { GenerateMFAService } from './generate_mfa/services/generate-mfa-service';
import { JWKSService } from './jwks/service/jwks.service';
import { PasswordResetRequestService } from './password_reset_request/service/password_reset_request.service';
import { PasswordResetService } from './password_reset/service/password_reset.service';
import { ValidateMFAService } from './validate_mfa/services/validate-MFA-service';
import { RefreshTokenController } from './refresh_token/controller/refresh-token.controller';
import { LogoutController } from './logout/controller/logout.controller';
import { LogoutService } from './logout/service/logout.service';
import { AuthSocialLoginController } from './social_login/controllers/social_login.controller';
import { AuthSocialLoginService } from './social_login/services/auth_social_login.service';
import { GoogleOAuthClientService } from './social_login/services/google_oauth_client.service';
import { GoogleProviderService } from './social_login/services/google_provider.service';
import { IdentityProviderService } from './social_login/services/identity_provider.service';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { EntityRepository } from '@modules/auth/entity/shared/repositories/entity-repository';
import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { IdentityRepository } from '@modules/auth/user/shared/repositories/user-repository';
import { IMFACodeRepository } from '@modules/auth/mfa/shared/repositories/abstract_class/imfa-code-repository';
import { MFACodeRepository } from '@modules/auth/mfa/shared/repositories/mfa-code-repository';
import { IPasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/abstract_class/ipassword-reset-tokens-repository';
import { PasswordResetTokensRepository } from '@modules/auth/password_reset_tokens/shared/repositories/password-reset-tokens-repository';
import { IRefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/abstract_class/irefresh-tokens-repository';
import { RefreshTokensRepository } from '@modules/auth/refresh_token/shared/repositories/refresh-tokens-repository';
import { RefreshTokenService } from './refresh_token/service/refresh-token.service';
import { MFAConfirmController } from './mfa_confirm/controller/mfa_confirm.controller';
import { MFARequestService } from './mfa_reset_request/service/mfa_request.service';
import { MFARequestController } from './mfa_reset_request/controller/mfa_request.controller';
import { MFAConfirmService } from './mfa_confirm/service/mfa_confirm.service';
import { IProfileRepository } from '../profile/shared/repositories/abstract_class/iprofile-repository';
import { ProfileRepository } from '../profile/shared/repositories/profile-repository';
import { ChangeProfileController } from './change_profile/controller/change_profile.controller';
import { MeProfileController } from './me_profile/controller/me_profile.controller';
import { MeProfileService } from './me_profile/service/me_profile.service';
import { ChangeProfileService } from './change_profile/service/change_profile.service';
import { SelectEntityController } from './select_entity/controller/select_entity.controller';
import { SelectEntityService } from './select_entity/service/select_entity.service';
import { EntityMembershipCreateService } from '../../business/use_cases/entity_membership/create/services/entity_membership_create.service';
import { EntityMembershipGetAllService } from '../../business/use_cases/entity_membership/get_all/services/entity_membership_get_all.service';
import { EntityMembershipGetOneService } from '../../business/use_cases/entity_membership/get_one/services/entity_membership_get_one.service';
import { EntityMembershipUpdateService } from '../../business/use_cases/entity_membership/update/services/entity_membership_update.service';
import { EntityMembershipUpdateController } from '../../business/use_cases/entity_membership/update/controller/entity_membership_update.controller';
import { EntityMembershipCreateController } from '../../business/use_cases/entity_membership/create/controller/entity_membership_create.controller';
import { EntityMembershipGetAllController } from '../../business/use_cases/entity_membership/get_all/controller/entity_membership_get_all.controller';
import { EntityMembershipGetOneController } from '../../business/use_cases/entity_membership/get_one/controller/entity_membership_get_one.controller';
import { IEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/abstract_class/ientitycustomer-repository';
import { EntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/entitycustomer-repository';
import { IEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/abstract_class/ientitymembership-repository';
import { EntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/entitymembership-repository';
import { IIdentityCredentialRepository } from '../identity_credential/shared/repositories/abstract_class/iidentitycredential-repository';
import { IdentityCredentialRepository } from '../identity_credential/shared/repositories/identity-credential-repository';
import { IEmailService } from 'infra/email/abstract class/IEmailService';
import { ResendEmailService } from 'infra/email/services/resend_email_service';
import { GeoapifyGeocodingService } from 'infra/geolocalization/service/geoapify_geocoding.service';
import { IAddressRepository } from '../address/shared/repositories/abstract_class/iaddress-repository';
import { AddressRepository } from '../address/shared/repositories/address-repository';
import { IGeocodingService } from 'infra/geolocalization/interface/IGeocoding.service';
import { ICustomerRepository } from '@modules/business/customer/shared/repositories/abstract_class/icustomer-repository';
import { CustomerRepository } from '@modules/business/customer/shared/repositories/customer-repository';

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
    GenerateMFAController,
    JWKSController,
    PasswordResetController,
    PasswordResetRequestController,
    SignUpController,
    SignInController,
    ValidateMFAController,
    RefreshTokenController,
    LogoutController,
    AuthSocialLoginController,
    MFAConfirmController,
    MFARequestController,
    ChangeProfileController,
    MeProfileController,
    SelectEntityController,
    EntityMembershipCreateController,
    EntityMembershipUpdateController,
    EntityMembershipGetAllController,
    EntityMembershipGetOneController,
  ],
  providers: [
    {
      provide: IProfileRepository,
      useClass: ProfileRepository,
    },
    {
      provide: IEntityRepository,
      useClass: EntityRepository,
    },
    {
      provide: IEntityCustomerRepository,
      useClass: EntityCustomerRepository,
    },
    {
      provide: IEntityMembershipRepository,
      useClass: EntityMembershipRepository,
    },
    {
      provide: IIdentityRepository,
      useClass: IdentityRepository,
    },
    {
      provide: IEmailService,
      useClass: ResendEmailService,
    },
    {
      provide: IIdentityCredentialRepository,
      useClass: IdentityCredentialRepository,
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
      provide: IAddressRepository,
      useClass: AddressRepository,
    },
    {
      provide: ICustomerRepository,
      useClass: CustomerRepository,
    },
    IdentityProviderService,
    GoogleProviderService,
    GoogleOAuthClientService,
    AuthSocialLoginService,
    GenerateMFAService,
    JWKSService,
    PasswordResetService,
    PasswordResetRequestService,
    SignUpService,
    SignInService,
    ValidateMFAService,
    RefreshTokenService,
    LogoutService,
    MFAConfirmService,
    MFARequestService,
    MeProfileService,
    ChangeProfileService,
    SelectEntityService,
    EntityMembershipCreateService,
    EntityMembershipUpdateService,
    EntityMembershipGetAllService,
    EntityMembershipGetOneService,
    {
      provide: IGeocodingService,
      useClass: GeoapifyGeocodingService,
    },
  ],
  exports: [JwtModule, AuthModule],
})
export class AuthModule {}
