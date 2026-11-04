import { Address } from '@modules/auth/address/shared/models/address';
import { IAddressRepository } from '@modules/auth/address/shared/repositories/abstract_class/iaddress-repository';
import { Entity } from '@modules/auth/entity/shared/models/entity';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { Plan } from '@modules/business/plan/shared/models/plan';
import { IPlanRepository } from '@modules/business/plan/shared/repositories/abstract_class/iplan-repository';
import { AppError } from '@modules/utils/app_error';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { IGeocodingService } from 'infra/geolocalization/interface/IGeocoding.service';

interface IEntityRequest {
  id: string;
  name: string;
  email: string;
  type: string;
  document: string;
  phone: string;
  photo: string;
  status: string;
  zip_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  country: string;
}

@Injectable()
export class EntityUpdateService {
  constructor(
    private readonly entity_repository: IEntityRepository,
    private readonly address_repository: IAddressRepository,
    private readonly prisma: PrismaService,
    private readonly geocoding_service: IGeocodingService,
  ) {}

  public async execute({
    document,
    email,
    phone,
    photo,
    status,
    type,
    name,
    id,
    zip_code,
    street,
    number,
    neighborhood,
    city,
    state,
    complement,
    country,
  }: IEntityRequest): Promise<Entity> {
    const entity_exists = await this.entity_repository.findById(id);
    if (!entity_exists) throw new AppError('Empresa não existe', 404);
    const entity = new Entity(
      {
        name: name,
        status: status,
        type: type,
        document: document,
        email: email,
        phone: phone,
        photo: photo,
        created_at: entity_exists.created_at,
      },
      entity_exists._id,
    );
    const address_exists = await this.address_repository.findByEntityId(
      entity._id,
    );
    const geolocalization = await this.geocoding_service.geocode({
      city,
      country,
      number,
      state,
      street,
      zip_code,
    });
    let address: Address = null;
    if (address_exists) {
      address = new Address(
        {
          city: city,
          country: country,
          entity_id: entity._id,
          latitude: geolocalization.latitude,
          longitude: geolocalization.longitude,
          neighborhood: neighborhood,
          number: number,
          state: state,
          street: street,
          zip_code: zip_code,
          complement: complement ?? null,
        },
        address_exists._id,
      );
    } else {
      address = new Address({
        city: city,
        country: country,
        entity_id: entity._id,
        latitude: geolocalization.latitude,
        longitude: geolocalization.longitude,
        neighborhood: neighborhood,
        number: number,
        state: state,
        street: street,
        zip_code: zip_code,
        complement: complement ?? null,
      });
    }
    const prisma = this.prisma.getPrismaClient();
    try {
      await prisma.$transaction(async (tx) => {
        await this.entity_repository.update(entity, tx);
        await this.address_repository.update(address, tx);
      });
    } catch (error) {
      throw new AppError(
        'Não foi possível concluir o cadastro. Tente novamente.',
        500,
      );
    }
    return entity;
  }
}
