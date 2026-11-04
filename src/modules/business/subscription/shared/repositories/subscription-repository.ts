import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from './abstract_class/isubscription-repository';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Subscription } from '../models/subscription';
import { SubscriptionMapper } from 'infra/database/mappers/SubscriptionMapper';

@Injectable()
class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private prisma: PrismaService) {}
  async findAll(): Promise<Subscription[]> {
    const list_subscription = await this.prisma
      .getPrismaClient()
      .subscription.findMany();
    return list_subscription.map((item) => SubscriptionMapper.toDomain(item));
  }
  async list_by_plan_id(plan_id: string): Promise<Subscription[]> {
    const list_subscription = await this.prisma
      .getPrismaClient()
      .subscription.findMany({
        where: {
          plan_id: plan_id,
        },
      });
    return list_subscription.map((item) => SubscriptionMapper.toDomain(item));
  }
  async find_one_by_entity_id(entity_id: string): Promise<Subscription | null> {
    const subscription = await this.prisma
      .getPrismaClient()
      .subscription.findFirst({
        where: {
          entity_id: entity_id,
        },
      });
    return SubscriptionMapper.toDomain(subscription);
  }
  async update(data: Subscription): Promise<void> {
    const raw = SubscriptionMapper.toPrisma(data);
    await this.prisma.getPrismaClient().subscription.update({
      where: {
        id: data._id,
      },
      data: raw,
    });
  }

  async create(
    data: Subscription,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const raw = SubscriptionMapper.toPrisma(data);
    await this.prisma.getPrismaClient().subscription.create({
      data: raw,
    });
  }
  async find_one(id: string): Promise<Subscription | null> {
    const plan = await this.prisma.getPrismaClient().subscription.findFirst({
      where: {
        id: id,
      },
    });
    if (!plan) return null;
    return SubscriptionMapper.toDomain(plan);
  }
}

export { SubscriptionRepository };
