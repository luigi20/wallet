import { Prisma } from '@prisma/client';
import { Entity_Customer } from '../../models/entity_customer';

abstract class IEntityCustomerRepository {
  abstract create(
    data: Entity_Customer,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
  abstract update(
    data: Entity_Customer,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
  abstract find_list_entity_id(entity_id: string): Promise<Entity_Customer[]>;
  abstract find_customer_id(customer_id: string): Promise<Entity_Customer[]>;
  abstract find_one(
    entity_id: string,
    customer_id: string,
  ): Promise<Entity_Customer | null>;
  abstract find_all(): Promise<Entity_Customer[]>;
}
export { IEntityCustomerRepository };
