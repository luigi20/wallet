import { MFA_Code } from '@modules/auth/mfa/shared/models/mfa_code';
import { MfaCode as PrismaMFACode } from '@prisma/client';
export class MFACodeMapper {
  static toPrisma(mfa_code: MFA_Code) {
    return {
      id: mfa_code.id,
      code: mfa_code.code,
      user_id: mfa_code.user_id,
      attempts: mfa_code.attempts,
      type: mfa_code.type,
      expires_at: mfa_code.expires_at,
      used_at: mfa_code.used_at,
      created_at: mfa_code.created_at,
      updated_at: mfa_code.updated_at,
    };
  }

  static toDomain(raw: PrismaMFACode): MFA_Code {
    return new MFA_Code(
      {
        user_id: raw.user_id,
        code: raw.code,
        attempts: raw.attempts,
        type: raw.type,
        expires_at: raw.expires_at,
        used_at: raw.used_at,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
      },
      raw.id,
    );
  }
}
