import { randomUUID } from 'crypto';
import { Replace } from '@utils/helper';

export interface Subscription_Props {
  entity_id: string;
  entity_name: string;
  plan_id: string;
  plan_name: string;
  status: string;
  started_at: Date;
  ended_at: Date;
  created_at: Date;
  updated_at: Date;
}

export class Subscription {
  private id: string;
  private props: Subscription_Props;

  constructor(
    props: Replace<
      Subscription_Props,
      {
        created_at?: Date;
        updated_at?: Date;
        ended_at?: Date;
        entity_name?: string;
        plan_name?: string;
      }
    >,
    id?: string,
  ) {
    this.id = id ?? randomUUID();
    this.props = {
      ...props,
      created_at: props.created_at ?? new Date(),
      updated_at: props.updated_at ?? new Date(),
      ended_at: props.ended_at ?? null,
      entity_name: props.entity_name ?? null,
      plan_name: props.plan_name ?? null,
    };
  }

  public get plan_name(): string {
    return this.props.entity_name;
  }

  public set plan_name(plan_name: string) {
    this.props.entity_name = plan_name;
  }

  public get entity_name(): string {
    return this.props.entity_name;
  }

  public set entity_name(entity_name: string) {
    this.props.entity_name = entity_name;
  }

  public get _id() {
    return this.id;
  }

  public get entity_id(): string {
    return this.props.entity_id;
  }

  public set entity_id(entity_id: string) {
    this.props.entity_id = entity_id;
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

  public get plan_id(): string {
    return this.props.plan_id;
  }

  public set plan_id(plan_id: string) {
    this.props.plan_id = plan_id;
  }

  public get status(): string {
    return this.props.status;
  }

  public set status(status: string) {
    this.props.status = status;
  }

  public get started_at(): Date {
    return this.props.started_at;
  }

  public set started_at(started_at: Date) {
    this.props.started_at = started_at;
  }

  public get ended_at(): Date {
    return this.props.ended_at;
  }

  public set ended_at(ended_at: Date) {
    this.props.ended_at = ended_at;
  }
}
