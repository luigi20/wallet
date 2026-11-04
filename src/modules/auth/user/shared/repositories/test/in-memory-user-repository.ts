import { Injectable } from '@nestjs/common';
import { User } from '../../models/user';
import { IUserRepository } from '../abstract_class/IUser-repository';

@Injectable()
class InMemoryUserRepository implements IUserRepository {
  async update(data: User): Promise<void> {
    const index = this.list_users.findIndex((item) => item.id === data.id);
    if (index >= 0) {
      this.list_users[index] = data;
    }
  }
  async update_last_login_at(id: string, last_login_at: Date): Promise<void> {
    const index = this.list_users.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.list_users[index].last_login_at = last_login_at;
    }
  }
  async find_by_email(email: string): Promise<User | null> {
    const user = this.list_users.find((item) => item.email === email);
    if (!user) return null;
    return user;
  }

  async find_by_id(id: string): Promise<User | null> {
    const user = this.list_users.find((item) => item.id === id);
    if (!user) return null;
    return user;
  }

  async set_update_mfa_required(
    id: string,
    mfa_required: boolean,
  ): Promise<void> {
    const index = this.list_users.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.list_users[index].mfa_required = mfa_required;
    }
  }
  public list_users: User[] = [];

  async create(data: User): Promise<void> {
    this.list_users.push(data);
  }
}
export { InMemoryUserRepository };
