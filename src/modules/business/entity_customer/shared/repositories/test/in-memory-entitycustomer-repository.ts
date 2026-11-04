import { Injectable } from '@nestjs/common';
import { IEntityCustomerRepository } from '../abstract_class/ientitycustomer-repository';
import { Entity_Customer } from '../../models/entity_customer';

@Injectable()
export class InMemoryEntityCustomerRepository implements IEntityCustomerRepository {
  async find_all(): Promise<Entity_Customer[]> {
    return this.list_customer;
  }
  async find_customer_id(customer_id: string): Promise<Entity_Customer[]> {
    const list_entity_customer = this.list_customer.filter(
      (item) => item.customer_id === customer_id,
    );
    return list_entity_customer;
  }
  async find_one(
    entity_id: string,
    customer_id: string,
  ): Promise<Entity_Customer | null> {
    const entity_customer = this.list_customer.find(
      (item) =>
        item.entity_id === entity_id && item.customer_id === customer_id,
    );
    if (!entity_customer) return null;
    return entity_customer;
  }
  async find_list_entity_id(entity_id: string): Promise<Entity_Customer[]> {
    const list_entity_customer = this.list_customer.filter(
      (item) => item.entity_id === entity_id,
    );
    return list_entity_customer;
  }
  async update(data: Entity_Customer): Promise<void> {
    const index = this.list_customer.findIndex(
      (item) =>
        item.entity_id === data.entity_id &&
        item.customer_id === data.customer_id,
    );
    if (index >= 0) {
      this.list_customer[index] = data;
    }
  }
  public list_customer: Entity_Customer[] = [];

  async create(data: Entity_Customer): Promise<void> {
    this.list_customer.push(data);
  }
}
