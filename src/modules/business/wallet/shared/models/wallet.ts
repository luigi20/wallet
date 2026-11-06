import { Replace } from '@modules/utils/helper';
import { randomUUID } from 'crypto';

export interface Wallet_Props {
  created_at: Date;
  updated_at: Date;
  user_id: string;
  balance: number;
}

export class Wallet {
  private _id: string;
  private props: Wallet_Props;

  constructor(
    props: Replace<
      Wallet_Props,
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

  public get balance(): number {
    return this.props.balance;
  }

  public set balance(balance: number) {
    this.props.balance = balance;
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
