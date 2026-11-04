import { Injectable } from '@nestjs/common';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Customer } from '../models/customer';
import { CustomerMapper } from 'infra/database/mappers/CustomerMapper';
import { ICustomerRepository } from './abstract_class/icustomer-repository';

@Injectable()
class CustomerRepository implements ICustomerRepository {
  constructor(private prisma: PrismaService) {}

  async update(data: Customer, tx?: Prisma.TransactionClient): Promise<void> {
    const raw = CustomerMapper.toPrisma(data);
    const client = tx ?? this.prisma;
    await client.customer.update({
      where: {
        id: data._id,
      },
      data: raw,
    });
  }
  async find_profile_id(profile_id: string): Promise<Customer | null> {
    const customer = await this.prisma.getPrismaClient().customer.findUnique({
      where: {
        profile_id: profile_id,
      },
    });
    if (!customer) return null;
    return CustomerMapper.toDomain(customer);
  }
  async find_one(id: string): Promise<Customer | null> {
    const customer = await this.prisma.getPrismaClient().customer.findFirst({
      where: {
        id: id,
      },
    });
    if (!customer) return null;
    return CustomerMapper.toDomain(customer);
  }

  async find_all(): Promise<string[]> {
    const list_customer = await this.prisma
      .getPrismaClient()
      .customer.findMany();
    return list_customer.map((item) => item.id);
  }

  async create(data: Customer, tx?: Prisma.TransactionClient): Promise<void> {
    const raw = CustomerMapper.toPrisma(data);
    const client = tx ?? this.prisma;
    await client.customer.update({
      data: raw,
    });
  }
}
export { CustomerRepository };
