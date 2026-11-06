import { Replace } from '@modules/utils/helper';
import { randomUUID } from 'crypto';

export interface Password_Reset_Tokens_Props {
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: boolean;
  created_at: Date;
  updated_at: Date;
}

export class Password_Reset_Tokens {
  private _id: string;
  private props: Password_Reset_Tokens_Props;

  constructor(
    props: Replace<
      Password_Reset_Tokens_Props,
      {
        created_at?: Date;
        updated_at?: Date;
      }
    >,
    id?: string,
  ) {
    this._id = id ?? randomUUID();
    this.props = {
      ...props,
      created_at: props.created_at ?? new Date(),
      updated_at: props.updated_at ?? new Date(),
    };
  }

  public get id() {
    return this._id;
  }

  public get user_id(): string {
    return this.props.user_id;
  }

  public set user_id(user_id: string) {
    this.props.user_id = user_id;
  }

  public get token_hash(): string {
    return this.props.token_hash;
  }

  public set token_hash(token_hash: string) {
    this.props.token_hash = token_hash;
  }

  public get expires_at(): Date {
    return this.props.expires_at;
  }

  public set expires_at(expires_at: Date) {
    this.props.expires_at = expires_at;
  }

  public get used_at(): boolean {
    return this.props.used_at;
  }

  public set used_at(used_at: boolean) {
    this.props.used_at = used_at;
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
}
