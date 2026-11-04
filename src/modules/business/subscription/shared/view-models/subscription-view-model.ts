import { Subscription } from '../models/subscription';

export class SubscriptionViewModel {
  static toHttp(subscription: Subscription) {
    return {
      id: subscription._id,
      entity_id: subscription.entity_id,
      plan_id: subscription.plan_id,
      entity_name: subscription.entity_name,
      plan_name: subscription.plan_name,
      status: subscription.status,
      started_at: subscription.started_at,
      ended_at: subscription.ended_at ? subscription.ended_at : null,
    };
  }
}
