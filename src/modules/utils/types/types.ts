import { Request } from 'express';
import { MemberRole } from '../enum';

export interface AuthRequest extends Request {
  auth: {
    user_id: string;
    profile_id: string;
    entity_id: string;
    roles?: MemberRole[];
    name?: string;
    photo?: string;
    is_superuser?: boolean;
  };
}

export type entity_name = {
  id: string;
  entity_name: string;
  roles: string[];
};

export type IdAndName = {
  id: string;
  name: string;
};
