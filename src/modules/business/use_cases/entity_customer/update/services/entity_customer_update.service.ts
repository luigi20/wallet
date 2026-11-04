import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '@modules/auth/profile/shared/repositories/abstract_class/iprofile-repository';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { AppError } from '@modules/utils/app_error';
import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { Identity } from '@modules/auth/user/shared/models/user';
import { Profile } from '@modules/auth/profile/shared/models/profile';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { IEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/abstract_class/ientitycustomer-repository';
import { Entity_Customer } from '@modules/business/entity_customer/shared/models/entity_customer';
import { ICustomerRepository } from '@modules/business/customer/shared/repositories/abstract_class/icustomer-repository';
import { Customer } from '@modules/business/customer/shared/models/customer';

interface IMembersRequest {
  entity_id: string;
  email: string;
  mfa_required: boolean;
  name: string;
  phone: string;
  photo: string;
  birth_date: string;
  notes: string;
  status: string;
}

@Injectable()
export class EntityCustomerUpdateService {
  constructor(
    private readonly entity_customer_repository: IEntityCustomerRepository,
    private readonly profile_repository: IProfileRepository,
    private readonly entity_repository: IEntityRepository,
    private readonly identity_repository: IIdentityRepository,
    private readonly prisma: PrismaService,
    private readonly customer_repository: ICustomerRepository,
  ) {}

  public async execute({
    birth_date,
    email,
    mfa_required,
    name,
    phone,
    photo,
    notes,
    entity_id,
    status,
  }: IMembersRequest): Promise<Entity_Customer> {
    const info_entity =
      await this.entity_repository.findByIdSelectIdAndName(entity_id);
    if (!info_entity) throw new AppError('Empresa não existe', 404);
    const identity_exists = await this.identity_repository.find_by_email(
      email.toLowerCase().trim(),
    );
    if (!identity_exists) throw new AppError('Credenciais inválidas', 400);
    const profile_exists = await this.profile_repository.find_user_id(
      identity_exists.id,
    );
    if (!profile_exists) throw new AppError('Perfil não existe', 404);
    const customer_exists = await this.customer_repository.find_profile_id(
      profile_exists.id,
    );
    if (!customer_exists) throw new AppError('Cliente não existe', 404);
    const entity_customer_exists =
      await this.entity_customer_repository.find_one(
        info_entity.id,
        profile_exists.id,
      );
    if (!entity_customer_exists)
      throw new AppError('Usuário não pertence a essa organização', 404);
    const identity = new Identity(
      {
        email: email,
        mfa_required: mfa_required,
        status: status,
        is_superuser: identity_exists.is_superuser,
        last_login_at: identity_exists.last_login_at,
        created_at: identity_exists.created_at,
      },
      identity_exists.id,
    );
    const profile = new Profile(
      {
        user_id: profile_exists.user_id,
        name: name,
        birth_date: new Date(birth_date),
        phone: phone,
        photo: photo,
        roles: ['cliente'],
        status: status,
      },
      profile_exists.id,
    );
    const customer = new Customer(
      {
        profile_id: profile.id,
      },
      customer_exists._id,
    );
    const entity_customer = new Entity_Customer({
      entity_id: entity_customer_exists.entity_id,
      customer_id: customer._id,
      notes: notes,
      status: status,
      birth_date: new Date(birth_date),
      phone: phone,
      photo: photo,
      name: name,
      profile_name: profile.name,
      entity_name: info_entity.name,
    });
    const prisma = this.prisma.getPrismaClient();
    try {
      await prisma.$transaction(async (tx) => {
        await this.identity_repository.update(identity, tx);
        await this.profile_repository.update(profile, tx);
        await this.customer_repository.update(customer, tx);
        await this.entity_customer_repository.update(entity_customer, tx);
      });
    } catch (error) {
      throw new AppError(
        'Não foi possível concluir o cadastro. Tente novamente.',
        500,
      );
    }
    return entity_customer;
  }
}
