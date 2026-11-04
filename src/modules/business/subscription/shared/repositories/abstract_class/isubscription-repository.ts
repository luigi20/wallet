import { Prisma } from '@prisma/client';
import { Subscription } from '../../models/subscription';

abstract class ISubscriptionRepository {
  abstract create(
    data: Subscription,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
  abstract update(data: Subscription): Promise<void>;
  abstract find_one(id: string): Promise<Subscription | null>;
  abstract find_one_by_entity_id(
    entity_id: string,
  ): Promise<Subscription | null>;
  abstract list_by_plan_id(plan_id: string): Promise<Subscription[]>;
  abstract findAll(): Promise<Subscription[]>;
}
export { ISubscriptionRepository };
