import { Profile } from '@modules/auth/profile/shared/models/profile';
import { Entity_Customer } from '@modules/business/entity_customer/shared/models/entity_customer';
import { Replace } from '@modules/utils/helper';
import { randomUUID } from 'crypto';

export interface Customer_Props {
  profile?: Profile;
  entity_customers: Entity_Customer[];
  profile_id: string;
  created_at: Date;
  updated_at: Date;
  /*profile_id: string;
  notes: string;
  status: string;

  entity_name: string;
  profile_name: string;
  phone: string;
  photo: string;
  birth_date: Date;*/
}

export class Customer {
  private id: string;
  private props: Customer_Props;

  constructor(
    props: Replace<
      Customer_Props,
      {
        created_at?: Date;
        updated_at?: Date;
        profile?: Profile;
        entity_customers?: Entity_Customer[];
        /* notes?: string;
        name?: string;
        profile_name?: string;
        entity_name?: string;
        phone?: string;
        photo?: string;
        birth_date?: Date;*/
      }
    >,
    id?: string,
  ) {
    this.id = id ?? randomUUID();
    this.props = {
      ...props,
      created_at: props.created_at ?? new Date(),
      updated_at: props.updated_at ?? new Date(),
      profile: props.profile ?? null,
      entity_customers: props.entity_customers ?? [],
      /* notes: props.notes ?? null,
      name: props.name ?? null,
      profile_name: props.profile_name ?? null,
      entity_name: props.entity_name ?? null,
      phone: props.phone ?? null,
      photo: props.photo ?? null,
      birth_date: props.birth_date ?? null, */
    };
  }

  public get _id(): string {
    return this.id;
  }

  public get profile_id(): string {
    return this.props.profile_id;
  }

  public set profile_id(profile_id: string) {
    this.props.profile_id = profile_id;
  }

  public get entity_customers(): Entity_Customer[] {
    return this.props.entity_customers;
  }

  public set entity_customers(entity_customers: Entity_Customer[]) {
    this.props.entity_customers = entity_customers;
  }

  public get profile(): Profile {
    return this.props.profile;
  }

  public set profile(profile: Profile) {
    this.props.profile = profile;
  }

  /*
  public get birth_date(): Date {
    return this.props.birth_date;
  }

  public set birth_date(birth_date: Date) {
    this.props.birth_date = birth_date;
  }

  public get photo(): string {
    return this.props.photo;
  }

  public set photo(photo: string) {
    this.props.photo = photo;
  }

  public get phone(): string {
    return this.props.phone;
  }

  public set phone(phone: string) {
    this.props.phone = phone;
  }

  public get entity_name(): string {
    return this.props.entity_name;
  }

  public set entity_name(entity_name: string) {
    this.props.entity_name = entity_name;
  }

  public get entity_id(): string {
    return this.props.entity_id;
  }

  public set entity_id(entity_id: string) {
    this.props.entity_id = entity_id;
  }

  public get profile_name(): string {
    return this.props.profile_name;
  }

  public set profile_name(profile_name: string) {
    this.props.profile_name = profile_name;
  }

  public get profile_id(): string {
    return this.props.profile_id;
  }

  public set profile_id(profile_id: string) {
    this.props.profile_id = profile_id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get notes(): string {
    return this.props.notes;
  }

  public set notes(notes: string) {
    this.props.notes = notes;
  }

  public get status(): string {
    return this.props.status;
  }

  public set status(status: string) {
    this.props.status = status;
  }*/

  public get created_at(): Date {
    return this.props.updated_at;
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
}
