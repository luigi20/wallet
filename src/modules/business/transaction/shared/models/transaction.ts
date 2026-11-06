import { Replace } from '@modules/utils/helper';
import { randomUUID } from 'crypto';

export interface Transaction_Props {
  created_at: Date;
  updated_at: Date;
  sender_wallet_id: string;
  receiver_wallet_id: string;
  amount: number;
  status: string;
}

export class Transaction {
  private _id: string;
  private props: Transaction_Props;

  constructor(
    props: Replace<
      Transaction_Props,
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

  public get sender_wallet_id(): string {
    return this.props.sender_wallet_id;
  }

  public set sender_wallet_id(sender_wallet_id: string) {
    this.props.sender_wallet_id = sender_wallet_id;
  }

  public get receiver_wallet_id(): string {
    return this.props.receiver_wallet_id;
  }

  public set receiver_wallet_id(receiver_wallet_id: string) {
    this.props.receiver_wallet_id = receiver_wallet_id;
  }

  public get status(): string {
    return this.props.status;
  }

  public set status(status: string) {
    this.props.status = status;
  }

  public get amount(): number {
    return this.props.amount;
  }

  public set amount(amount: number) {
    this.props.amount = amount;
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
