import { IAddressRepository } from '@modules/auth/address/shared/repositories/abstract_class/iaddress-repository';
import { Entity } from '@modules/auth/entity/shared/models/entity';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EntityGetAllService {
  constructor(
    private readonly entity_repository: IEntityRepository,
    private readonly address_repository: IAddressRepository,
  ) {}

  public async execute(): Promise<Entity[]> {
    const list_entity = await this.entity_repository.list();
    if (list_entity.length === 0) return [];
    const list_entity_id = list_entity.map((item) => item._id);
    const list_address =
      await this.address_repository.findByListEntityId(list_entity_id);
    for (const entity of list_entity) {
      entity.address =
        list_address.find((address) => address.entity_id === entity._id) ??
        null;
    }
    return list_entity;
  }
}
