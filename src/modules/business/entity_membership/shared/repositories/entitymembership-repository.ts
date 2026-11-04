import { Injectable } from '@nestjs/common';
import { IEntityMembershipRepository } from './abstract_class/ientitymembership-repository';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { Entity_Membership } from '../models/entity_membership';
import { EntityMembershipMapper } from 'infra/database/mappers/EntityMembershipMapper';
import { Prisma } from '@prisma/client';

@Injectable()
class EntityMembershipRepository implements IEntityMembershipRepository {
  constructor(private prisma: PrismaService) {}

  async find_one_list(profile_id: string): Promise<Entity_Membership[]> {
    const list_entity_membership = await this.prisma
      .getPrismaClient()
      .entityMembership.findMany({
        where: {
          profile_id: profile_id,
        },
      });
    return list_entity_membership.map((item) =>
      EntityMembershipMapper.toDomain(item),
    );
  }
  async find_one(
    entity_id: string,
    profile_id: string,
  ): Promise<Entity_Membership | null> {
    const entity_membership = await this.prisma
      .getPrismaClient()
      .entityMembership.findUnique({
        where: {
          entity_id_profile_id: {
            entity_id: entity_id,
            profile_id: profile_id,
          },
        },
      });
    if (!entity_membership) return null;
    return EntityMembershipMapper.toDomain(entity_membership);
  }

  async find_all(): Promise<Entity_Membership[]> {
    const list_entity_membership = await this.prisma
      .getPrismaClient()
      .entityMembership.findMany();
    return list_entity_membership.map((item) =>
      EntityMembershipMapper.toDomain(item),
    );
  }

  async update(
    data: Entity_Membership,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const raw = EntityMembershipMapper.toPrisma(data);
    const client = tx ?? this.prisma;
    await client.entityMembership.update({
      data: raw,
    });
  }

  async create(
    data: Entity_Membership,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const raw = EntityMembershipMapper.toPrisma(data);
    const client = tx ?? this.prisma;
    await client.entityMembership.create({
      data: raw,
    });
  }
  async find_list_entity_id(entity_id: string): Promise<Entity_Membership[]> {
    const list_entity_membership = await this.prisma
      .getPrismaClient()
      .entityMembership.findMany({
        where: {
          entity_id: entity_id,
        },
      });
    return list_entity_membership.map((item) =>
      EntityMembershipMapper.toDomain(item),
    );
  }
  async find_list_profile_id(profile_id: string): Promise<Entity_Membership[]> {
    const list_entity_membership = await this.prisma
      .getPrismaClient()
      .entityMembership.findMany({
        where: {
          profile_id: profile_id,
        },
        include: {
          entity: {
            select: {
              name: true,
            },
          },
        },
      });
    return list_entity_membership.map((item) =>
      EntityMembershipMapper.toDomainWithProfEntityName(item),
    );
  }
}
export { EntityMembershipRepository };
