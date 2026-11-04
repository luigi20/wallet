import { Injectable } from '@nestjs/common';
import { IPlanRepository } from './abstract_class/iplan-repository';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PlanMapper } from 'infra/database/mappers/PlanMapper';
import { Plan } from '../models/plan';
import { IdAndName } from '@modules/utils/types/types';

@Injectable()
class PlanRepository implements IPlanRepository {
  constructor(private prisma: PrismaService) {}

  async findByIdSelectIdAndName(id: string): Promise<IdAndName | null> {
    const plan = await this.prisma.getPrismaClient().plan.findFirst({
      where: {
        id: id,
      },
    });
    if (!plan) return null;
    return {
      id: plan.id,
      name: plan.name,
    };
  }
  async update(data: Plan): Promise<void> {
    const raw = PlanMapper.toPrisma(data);
    await this.prisma.getPrismaClient().plan.update({
      where: {
        id: data._id,
      },
      data: raw,
    });
  }
  async list(): Promise<Plan[]> {
    const list_plan = await this.prisma.getPrismaClient().plan.findMany();
    return list_plan.map((item) => PlanMapper.toDomain(item));
  }
  async create(data: Plan, tx?: Prisma.TransactionClient): Promise<void> {
    const raw = PlanMapper.toPrisma(data);
    await this.prisma.getPrismaClient().plan.create({
      data: raw,
    });
  }
  async find_one(id: string): Promise<Plan | null> {
    const plan = await this.prisma.getPrismaClient().plan.findFirst({
      where: {
        id: id,
      },
    });
    if (!plan) return null;
    return PlanMapper.toDomain(plan);
  }
  async find_one_name(name: string): Promise<Plan | null> {
    const plan = await this.prisma.getPrismaClient().plan.findFirst({
      where: {
        name: {
          mode: 'insensitive',
          equals: name,
        },
      },
    });
    if (!name) return null;
    return PlanMapper.toDomain(plan);
  }
}

export { PlanRepository };
