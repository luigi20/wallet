import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { IProfileRepository } from '@modules/auth/profile/shared/repositories/abstract_class/iprofile-repository';
import { ICustomerRepository } from '@modules/business/customer/shared/repositories/abstract_class/icustomer-repository';
import { Entity_Customer } from '@modules/business/entity_customer/shared/models/entity_customer';
import { IEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/abstract_class/ientitycustomer-repository';
import { IEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/abstract_class/ientitymembership-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface IMFATokenPayload {
  sub: string;
  profile_id: string;
  entity_id: string;
  code: string;
  type: string;
  is_superuser: boolean;
  mfa_pending: boolean;
  iss: string;
  name: string;
  photo: string;
  roles: string[];
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwt_service: JwtService,
    private readonly identity_repository: IIdentityRepository,
    private readonly profile_repository: IProfileRepository,
    private readonly entity_customer_repository: IEntityCustomerRepository,
    private readonly entity_membership_repository: IEntityMembershipRepository,
    private readonly customer_repository: ICustomerRepository,
  ) {}

  async execute(refresh_token: string): Promise<{ access_token: string }> {
    let payload: IMFATokenPayload;
    try {
      payload = this.jwt_service.verify<IMFATokenPayload>(refresh_token);
    } catch {
      throw new AppError('Token inválido ou expirado', 401);
    }
    if (payload?.type !== 'refresh') throw new AppError('Token inválido');
    const identity = await this.identity_repository.find_by_id(payload.sub);
    if (!identity) throw new AppError('Credenciais inválidas', 401);
    const profile = await this.profile_repository.find_user_id(identity.id);
    if (!profile) throw new AppError('Perfil não encontrado', 404);
    const membership = await this.entity_membership_repository.find_one(
      payload.entity_id,
      profile.id,
    );
    const customer_exists = await this.customer_repository.find_profile_id(
      profile.id,
    );
    let entity_customer: Entity_Customer = null;
    if (customer_exists)
      entity_customer = await this.entity_customer_repository.find_one(
        payload.entity_id,
        customer_exists._id,
      );
    const isMember = membership && membership.status.toLowerCase() === 'ativo';
    const isCustomer =
      entity_customer && entity_customer?.status?.toLowerCase() === 'ativo';
    if (!isMember && !isCustomer)
      throw new AppError('Usuário não pertence a esta organização', 403);
    let roles: string[] = [];
    if (isMember) roles = membership.roles.map((item) => item);
    if (isCustomer) roles.push('cliente');
    const access_token = this.jwt_service.sign(
      {
        sub: identity.id,
        profile_id: profile.id,
        entity_id: payload.entity_id,
        name: profile.name,
        photo: profile.photo,
        roles: roles,
        type: 'access',
        is_superuser: identity.is_superuser,
        iss: 'saas-auth',
      },
      {
        expiresIn: '15m',
      },
    );
    return { access_token };
  }
}
