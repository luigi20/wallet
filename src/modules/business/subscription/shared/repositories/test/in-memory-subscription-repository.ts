import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from '../abstract_class/isubscription-repository';
import { Subscription } from '../../models/subscription';

@Injectable()
class InMemorySubscriptionRepository implements ISubscriptionRepository {
  async findAll(): Promise<Subscription[]> {
    return this.list_subscription;
  }

  async find_one_by_entity_id(entity_id: string): Promise<Subscription | null> {
    const subscription = this.list_subscription.find(
      (item) => item.entity_id === entity_id,
    );
    return subscription;
  }
  async update(data: Subscription): Promise<void> {
    const index = this.list_subscription.findIndex(
      (item) => item._id === data._id,
    );
    if (index >= 0) {
      this.list_subscription[index] = data;
    }
  }
  async list_by_plan_id(plan_id: string): Promise<Subscription[]> {
    const list_subscription = this.list_subscription.filter(
      (item) => item.plan_id === plan_id,
    );
    return list_subscription;
  }
  public list_subscription: Subscription[] = [];
  async create(data: Subscription): Promise<void> {
    this.list_subscription.push(data);
  }

  async find_one(id: string): Promise<Subscription | null> {
    const subscription = this.list_subscription.find((item) => item._id === id);
    if (!subscription) return null;
    return subscription;
  }
}
export { InMemorySubscriptionRepository };
