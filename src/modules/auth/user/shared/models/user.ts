import { Replace } from '@modules/utils/helper';
import { randomUUID } from 'crypto';

export interface User_Props {
  mfa_required: boolean;
  created_at: Date;
  updated_at: Date;
  email: string;
  name: string;
  password_hash: string;
  status: string;
  last_login_at: Date;
  document: string;
}

export class User {
  private _id: string;
  private props: User_Props;

  constructor(
    props: Replace<
      User_Props,
      {
        created_at?: Date;
        updated_at?: Date;
        last_login_at?: Date;
        mfa_required?: boolean;
        password_hash?: string;
      }
    >,
    id?: string,
  ) {
    this._id = id ?? randomUUID();
    this.props = {
      ...props,
      created_at: props.created_at ?? new Date(),
      updated_at: props.updated_at ?? new Date(),
      last_login_at: props.last_login_at ?? new Date(),
      mfa_required: props.mfa_required ?? false,
      password_hash: props.password_hash ?? null,
    };
  }

  public get id() {
    return this._id;
  }

  public get name(): string {
    return this.props.name;
  }

  public set name(name: string) {
    this.props.name = name;
  }

  public get document(): string {
    return this.props.document;
  }

  public set document(document: string) {
    this.props.document = document;
  }

  public get password_hash(): string {
    return this.props.password_hash;
  }

  public set password_hash(password_hash: string) {
    this.props.password_hash = password_hash;
  }

  public get mfa_required(): boolean {
    return this.props.mfa_required;
  }

  public set mfa_required(mfa_required: boolean) {
    this.props.mfa_required = mfa_required;
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

  public get last_login_at(): Date {
    return this.props.last_login_at;
  }

  public set last_login_at(last_login_at: Date) {
    this.props.last_login_at = last_login_at;
  }

  public get status(): string {
    return this.props.status;
  }

  public set status(status: string) {
    this.props.status = status;
  }

  public get email(): string {
    return this.props.email;
  }

  public set email(email: string) {
    this.props.email = email;
  }
}
