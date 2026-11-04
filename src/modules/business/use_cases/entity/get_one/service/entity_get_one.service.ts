import { IAddressRepository } from '@modules/auth/address/shared/repositories/abstract_class/iaddress-repository';
import { Entity } from '@modules/auth/entity/shared/models/entity';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';

interface IEntityRequest {
  id: string;
}

@Injectable()
export class EntityGetOneService {
  constructor(
    private readonly entity_repository: IEntityRepository,
    private readonly address_repository: IAddressRepository,
  ) {}

  public async execute({ id }: IEntityRequest): Promise<Entity> {
    const entity = await this.entity_repository.findById(id);
    if (!entity) throw new AppError('Empresa não existe', 404);
    const address = await this.address_repository.findByEntityId(entity._id);
    entity.address = address;
    return entity;
  }
}
