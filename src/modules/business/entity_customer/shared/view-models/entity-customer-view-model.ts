import { Entity_Customer } from '../models/entity_customer';

export class Entity_Customer_View_Model {
  static toHttp(entity_customer: Entity_Customer) {
    return {
      entity_name: entity_customer.entity_name,
      profile_name: entity_customer.profile_name,
      phone: entity_customer.phone,
      photo: entity_customer.photo,
      notes: entity_customer.notes,
      status: entity_customer.status,
      created_at: entity_customer.created_at,
      updated_at: entity_customer.updated_at,
    };
  }
}
