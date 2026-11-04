import { User } from '@modules/auth/user/shared/models/user';
import { User as PrismaUser } from '@prisma/client';
export class UserMapper {
  static toPrisma(user: User) {
    return {
      id: user.id,
      email: user.email,
      mfa_required: user.mfa_required,
      last_login_at: user.last_login_at,
      name: user.name,
      document: user.document,
      mfa_code: user.mfa_code,
      password_hash: user.password_hash,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  static toDomain(raw: PrismaUser): User {
    return new User(
      {
        email: raw.email,
        name: raw.name,
        mfa_required: raw.mfa_required,
        status: raw.status,
        last_login_at: raw.last_login_at,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
        document: raw.document,
        mfa_code_expires_at: raw.mfa_code_expires_at,
        mfa_code: raw.mfa_code_hash,
      },
      raw.id,
    );
  }
}
