import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PlanGetAllController } from './use_cases/plan/get_all/controller/plan_get_all.controller';
import { PlanGetOneController } from './use_cases/plan/get_one/controller/plan_get_one.controller';
import { PlanUpdateController } from './use_cases/plan/update/controller/plan_update.controller';
import { PlanCreateController } from './use_cases/plan/create/controller/plan_create.controller';
import { PlanCreateService } from './use_cases/plan/create/service/plan_create.service';
import { PlanUpdateService } from './use_cases/plan/update/service/plan_update.service';
import { PlanGetAllService } from './use_cases/plan/get_all/service/plan_get_all.service';
import { PlanGetOneService } from './use_cases/plan/get_one/service/plan_get_one.service';
import { SubscriptionCreateController } from './use_cases/subscription/create/controller/subscription_create.controller';
import { SubscriptionGetOneController } from './use_cases/subscription/get_one/controller/subscription_get_one.controller';
import { SubscriptionGetAllController } from './use_cases/subscription/get_all/controller/subscription_get_all.controller';
import { SubscriptionUpdateController } from './use_cases/subscription/update/controller/subscription_update.controller';
import { SubscriptionGetAllService } from './use_cases/subscription/get_all/service/subscription_get_all.service';
import { SubscriptionUpdateService } from './use_cases/subscription/update/service/subscription_update.service';
import { SubscriptionCreateService } from './use_cases/subscription/create/service/subscription_create.service';
import { SubscriptionGetOneService } from './use_cases/subscription/get_one/service/subscription_get_one.service';
import { IPlanRepository } from './plan/shared/repositories/abstract_class/iplan-repository';
import { PlanRepository } from './plan/shared/repositories/plan-repository';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { EntityRepository } from '@modules/auth/entity/shared/repositories/entity-repository';
import { ISubscriptionRepository } from './subscription/shared/repositories/abstract_class/isubscription-repository';
import { SubscriptionRepository } from './subscription/shared/repositories/subscription-repository';
import { ProfileRepository } from '@modules/auth/profile/shared/repositories/profile-repository';
import { IdentityRepository } from '@modules/auth/user/shared/repositories/user-repository';
import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { IProfileRepository } from '@modules/auth/profile/shared/repositories/abstract_class/iprofile-repository';
import { EntityCustomerCreateController } from './use_cases/entity_customer/create/controller/entity_customer_create.controller';
import { EntityCustomerUpdateController } from './use_cases/entity_customer/update/controller/entity_customer_update.controller';
import { EntityCustomerGetAllController } from './use_cases/entity_customer/get_all/controller/entity_customer_get_all.controller';
import { EntityCustomerGetOneController } from './use_cases/entity_customer/get_one/controller/entity_customer_get_one.controller';
import { EntityCustomerCreateService } from './use_cases/entity_customer/create/services/entity_customer_create.service';
import { EntityCustomerUpdateService } from './use_cases/entity_customer/update/services/entity_customer_update.service';
import { EntityCustomerGetAllService } from './use_cases/entity_customer/get_all/services/entity_customer_get_all.service';
import { EntityCustomerGetOneService } from './use_cases/entity_customer/get_one/services/entity_customer_get_one.service';
import { EntityMembershipRepository } from './entity_membership/shared/repositories/entitymembership-repository';
import { IEntityMembershipRepository } from './entity_membership/shared/repositories/abstract_class/ientitymembership-repository';
import { IEntityCustomerRepository } from './entity_customer/shared/repositories/abstract_class/ientitycustomer-repository';
import { EntityCustomerRepository } from './entity_customer/shared/repositories/entitycustomer-repository';
import { EntityGetAllController } from './use_cases/entity/get_all/controller/entity_get_all.controller';
import { EntityGetOneController } from './use_cases/entity/get_one/controller/entity_get_one.controller';
import { EntityUpdateController } from './use_cases/entity/update/controller/entity_update.controller';
import { EntityGetOneService } from './use_cases/entity/get_one/service/entity_get_one.service';
import { EntityGetAllService } from './use_cases/entity/get_all/service/entity_get_all.service';
import { EntityUpdateService } from './use_cases/entity/update/service/entity_update.service';
import { IIdentityCredentialRepository } from '@modules/auth/identity_credential/shared/repositories/abstract_class/iidentitycredential-repository';
import { IdentityCredentialRepository } from '@modules/auth/identity_credential/shared/repositories/identity-credential-repository';
import { IEmailService } from 'infra/email/abstract class/IEmailService';
import { ResendEmailService } from 'infra/email/services/resend_email_service';
import { IAddressRepository } from '@modules/auth/address/shared/repositories/abstract_class/iaddress-repository';
import { AddressRepository } from '@modules/auth/address/shared/repositories/address-repository';
import { GeoapifyGeocodingService } from 'infra/geolocalization/service/geoapify_geocoding.service';
import { IGeocodingService } from 'infra/geolocalization/interface/IGeocoding.service';
import { ICustomerRepository } from './customer/shared/repositories/abstract_class/icustomer-repository';
import { CustomerRepository } from './customer/shared/repositories/customer-repository';

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
    PlanUpdateController,
    PlanCreateController,
    PlanGetAllController,
    PlanGetOneController,
    SubscriptionCreateController,
    SubscriptionUpdateController,
    SubscriptionGetAllController,
    SubscriptionGetOneController,
    EntityCustomerCreateController,
    EntityCustomerUpdateController,
    EntityCustomerGetAllController,
    EntityCustomerGetOneController,
    EntityGetAllController,
    EntityGetOneController,
    EntityUpdateController,
  ],
  providers: [
    PlanCreateService,
    PlanUpdateService,
    PlanGetAllService,
    PlanGetOneService,
    SubscriptionCreateService,
    SubscriptionUpdateService,
    SubscriptionGetAllService,
    SubscriptionGetOneService,
    EntityCustomerCreateService,
    EntityCustomerUpdateService,
    EntityCustomerGetAllService,
    EntityCustomerGetOneService,
    EntityGetAllService,
    EntityGetOneService,
    EntityUpdateService,
    {
      provide: IGeocodingService,
      useClass: GeoapifyGeocodingService,
    },
    {
      provide: IAddressRepository,
      useClass: AddressRepository,
    },
    {
      provide: IIdentityCredentialRepository,
      useClass: IdentityCredentialRepository,
    },
    {
      provide: ICustomerRepository,
      useClass: CustomerRepository,
    },
    {
      provide: IPlanRepository,
      useClass: PlanRepository,
    },
    {
      provide: IEmailService,
      useClass: ResendEmailService,
    },
    {
      provide: IEntityRepository,
      useClass: EntityRepository,
    },
    {
      provide: ISubscriptionRepository,
      useClass: SubscriptionRepository,
    },
    {
      provide: IEntityMembershipRepository,
      useClass: EntityMembershipRepository,
    },
    {
      provide: IEntityCustomerRepository,
      useClass: EntityCustomerRepository,
    },
    {
      provide: IIdentityRepository,
      useClass: IdentityRepository,
    },
    {
      provide: IProfileRepository,
      useClass: ProfileRepository,
    },
    {
      provide: IEntityRepository,
      useClass: EntityRepository,
    },
  ],
  exports: [JwtModule, BusinessModule],
})
export class BusinessModule {}
