import { Prisma } from '@prisma/client';
import { Entity_Membership } from '../../models/entity_membership';

abstract class IEntityMembershipRepository {
  abstract create(
    data: Entity_Membership,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
  abstract update(
    data: Entity_Membership,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
  abstract find_list_entity_id(entity_id: string): Promise<Entity_Membership[]>;

  abstract find_all(): Promise<Entity_Membership[]>;
  abstract find_list_profile_id(
    profile_id: string,
  ): Promise<Entity_Membership[]>;

  abstract find_one(
    entity_id: string,
    profile_id: string,
  ): Promise<Entity_Membership | null>;
}
export { IEntityMembershipRepository };
