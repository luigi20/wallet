import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '@modules/auth/profile/shared/repositories/abstract_class/iprofile-repository';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { AppError } from '@modules/utils/app_error';
import { IEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/abstract_class/ientitycustomer-repository';
import { Entity_Customer } from '@modules/business/entity_customer/shared/models/entity_customer';
import { ICustomerRepository } from '@modules/business/customer/shared/repositories/abstract_class/icustomer-repository';
interface IMembersRequest {
  entity_id: string;
  profile_id: string;
  is_superuser: boolean;
  entity_id_user: string;
}

@Injectable()
export class EntityCustomerGetOneService {
  constructor(
    private readonly entity_customer_repository: IEntityCustomerRepository,
    private readonly profile_repository: IProfileRepository,
    private readonly entity_repository: IEntityRepository,
    private readonly customer_repository: ICustomerRepository,
  ) {}

  public async execute({
    entity_id,
    profile_id,
    entity_id_user,
    is_superuser,
  }: IMembersRequest): Promise<Entity_Customer> {
    if (!is_superuser && entity_id !== entity_id_user)
      throw new AppError(
        'Usuário não tem permissão de acessar dados de usuários de outra empresa',
        400,
      );
    const customer_exists =
      await this.customer_repository.find_profile_id(profile_id);
    if (!customer_exists) throw new AppError('Cliente não existe', 404);
    const member = await this.entity_customer_repository.find_one(
      entity_id,
      customer_exists._id,
    );
    if (!member) throw new AppError('Usuário não existe', 404);
    const customer = await this.customer_repository.find_one(
      member.customer_id,
    );
    if (!customer) throw new AppError('Cliente não existe', 404);
    const profile = await this.profile_repository.find_one(customer.profile_id);
    if (!profile) return;
    member.profile_name = profile.name;
    member.phone = profile.phone;
    member.photo = profile.photo;
    member.birth_date = profile.birth_date;
    const entity = await this.entity_repository.findByIdSelectIdAndName(
      member.entity_id,
    );
    if (entity) member.entity_name = entity.name;
    return member;
  }
}
