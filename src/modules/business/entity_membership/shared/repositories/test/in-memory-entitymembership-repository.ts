import { Injectable } from '@nestjs/common';
import { IEntityMembershipRepository } from '../abstract_class/ientitymembership-repository';
import { Entity_Membership } from '../../models/entity_membership';

@Injectable()
export class InMemoryEntityMembershipRepository implements IEntityMembershipRepository {
  async find_all(): Promise<Entity_Membership[]> {
    return this.list_membership;
  }
  async find_list_profile_id(profile_id: string): Promise<Entity_Membership[]> {
    const list_entity_membership = this.list_membership.filter(
      (item) => item.profile_id === profile_id,
    );
    return list_entity_membership;
  }
  async find_one(
    entity_id: string,
    profile_id: string,
  ): Promise<Entity_Membership | null> {
    const entity_membership = this.list_membership.find(
      (item) => item.entity_id === entity_id && item.profile_id === profile_id,
    );
    if (!entity_membership) return null;
    return entity_membership;
  }
  async find_list_entity_id(entity_id: string): Promise<Entity_Membership[]> {
    const list_entity_membership = this.list_membership.filter(
      (item) => item.entity_id === entity_id,
    );
    return list_entity_membership;
  }
  async update(data: Entity_Membership): Promise<void> {
    const index = this.list_membership.findIndex(
      (item) =>
        item.entity_id === data.entity_id &&
        item.profile_id === data.profile_id,
    );
    if (index >= 0) {
      this.list_membership[index] = data;
    }
  }
  public list_membership: Entity_Membership[] = [];

  async create(data: Entity_Membership): Promise<void> {
    this.list_membership.push(data);
  }
}
