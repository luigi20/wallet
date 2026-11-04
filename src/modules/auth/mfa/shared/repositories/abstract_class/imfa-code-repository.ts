import { MFA_Code } from '../../models/mfa_code';

abstract class IMFACodeRepository {
  abstract create(data: MFA_Code): Promise<void>;
  abstract update_used(id: string): Promise<void>;
  abstract update(data: MFA_Code): Promise<void>;
  abstract find_one(
    user_id: string,
    used: boolean,
    now: Date,
  ): Promise<MFA_Code | null>;
  abstract find_one_code_and_expires_at(
    code: string,
    used: boolean,
    now: Date,
  ): Promise<MFA_Code | null>;
}
export { IMFACodeRepository };
