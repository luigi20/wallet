import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '@modules/auth/profile/shared/repositories/abstract_class/iprofile-repository';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { AppError } from '@modules/utils/app_error';
import { IdAndName } from '@modules/utils/types/types';
import { IEntityCustomerRepository } from '@modules/business/entity_customer/shared/repositories/abstract_class/ientitycustomer-repository';
import { Entity_Customer } from '@modules/business/entity_customer/shared/models/entity_customer';
import { ICustomerRepository } from '@modules/business/customer/shared/repositories/abstract_class/icustomer-repository';

interface IMembersRequest {
  entity_id: string;
  is_superuser: boolean;
}

@Injectable()
export class EntityCustomerGetAllService {
  constructor(
    private readonly entity_customer_repository: IEntityCustomerRepository,
    private readonly profile_repository: IProfileRepository,
    private readonly entity_repository: IEntityRepository,
    private readonly customer_repository: ICustomerRepository,
  ) {}

  public async execute({
    entity_id,
    is_superuser,
  }: IMembersRequest): Promise<Entity_Customer[]> {
    let members: Entity_Customer[] = [];
    let entity: IdAndName = null;
    if (is_superuser) {
      members = await this.entity_customer_repository.find_all();
    } else {
      entity = await this.entity_repository.findByIdSelectIdAndName(entity_id);
      if (!entity) throw new AppError('Empresa não existe', 404);
      members =
        await this.entity_customer_repository.find_list_entity_id(entity_id);
    }
    if (members.length === 0) return [];
    await Promise.all(
      members.map(async (member) => {
        const customer = await this.customer_repository.find_one(
          member.customer_id,
        );
        if (!customer) return;
        const profile = await this.profile_repository.find_one(
          customer.profile_id,
        );
        if (!profile) return;
        member.profile_name = profile.name;
        member.phone = profile.phone;
        member.photo = profile.photo;
        member.birth_date = profile.birth_date;
        if (is_superuser) {
          const entity = await this.entity_repository.findByIdSelectIdAndName(
            member.entity_id,
          );
          if (entity) member.entity_name = entity.name;
        } else {
          if (entity) member.entity_name = entity.name;
        }
      }),
    );
    return members;
  }
}
