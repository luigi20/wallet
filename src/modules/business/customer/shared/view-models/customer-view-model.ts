import { Customer } from '../models/customer';

export class Customer_View_Model {
  static toHttp(customer: Customer) {
    return {
      id: customer._id,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };
  }
}
