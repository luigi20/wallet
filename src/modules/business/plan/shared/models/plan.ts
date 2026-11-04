import { randomUUID } from 'crypto';
import { Replace } from '@utils/helper';

export interface Plan_Props {
  name: string;
  price: number;
  description: string;
  max_members: number;
  max_customers: number;
  max_appointments: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class Plan {
  private id: string;
  private props: Plan_Props;

  constructor(
    props: Replace<
      Plan_Props,
      {
        created_at?: Date;
        updated_at?: Date;
        description?: string;
        max_members?: number;
        max_customers?: number;
        max_appointments?: number;
      }
    >,
    id?: string,
  ) {
    this.id = id ?? randomUUID();
    this.props = {
      ...props,
      created_at: props.created_at ?? new Date(),
      updated_at: props.updated_at ?? new Date(),
      description: props.description ?? null,
      max_members: props.max_members ?? null,
      max_customers: props.max_customers ?? null,
      max_appointments: props.max_appointments ?? null,
    };
  }

  public get _id() {
    return this.id;
  }

  public get price(): number {
    return this.props.price;
  }

  public set price(price: number) {
    this.props.price = price;
  }

  public get created_at(): Date {
    return this.props.created_at;
  }

  public set created_at(created_at: Date) {
    this.props.created_at = created_at;
  }

  public get updated_at(): Date {
    return this.props.updated_at;
  }

  public set updated_at(updated_at: Date) {
    this.props.updated_at = updated_at;
  }

  public get description(): string {
    return this.props.description;
  }

  public set description(description: string) {
    this.props.description = description;
  }

  public get max_members(): number {
    return this.props.max_members;
  }

  public set max_members(max_members: number) {
    this.props.max_members = max_members;
  }

  public get max_customers(): number {
    return this.props.max_customers;
  }

  public set max_customers(max_customers: number) {
    this.props.max_customers = max_customers;
  }

  public get name(): string {
    return this.props.name;
  }

  public set name(name: string) {
    this.props.name = name;
  }

  public get max_appointments(): number {
    return this.props.max_appointments;
  }

  public set max_appointments(max_appointments: number) {
    this.props.max_appointments = max_appointments;
  }

  public get active(): boolean {
    return this.props.active;
  }

  public set active(active: boolean) {
    this.props.active = active;
  }
}
