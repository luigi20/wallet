import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '@modules/auth/profile/shared/repositories/abstract_class/iprofile-repository';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { AppError } from '@modules/utils/app_error';
import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { Identity } from '@modules/auth/user/shared/models/user';
import { Profile } from '@modules/auth/profile/shared/models/profile';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { IEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/abstract_class/ientitymembership-repository';
import { Entity_Membership } from '@modules/business/entity_membership/shared/models/entity_membership';
import { MemberRole } from '@modules/utils/enum';

interface IMembersRequest {
  entity_id: string;
  user_id: string;
  email: string;
  mfa_required: boolean;
  name: string;
  phone: string;
  photo: string;
  birth_date: string;
  roles: string[];
  status: string;
  roles_auth: MemberRole[];
}

@Injectable()
export class EntityMembershipUpdateService {
  constructor(
    private readonly entity_membership_repository: IEntityMembershipRepository,
    private readonly profile_repository: IProfileRepository,
    private readonly entity_repository: IEntityRepository,
    private readonly identity_repository: IIdentityRepository,
    private readonly prisma: PrismaService,
  ) {}

  public async execute({
    birth_date,
    email,
    mfa_required,
    name,
    phone,
    photo,
    roles,
    entity_id,
    status,
    roles_auth,
    user_id,
  }: IMembersRequest): Promise<Entity_Membership> {
    const info_entity =
      await this.entity_repository.findByIdSelectIdAndName(entity_id);
    if (!info_entity) throw new AppError('Empresa não existe', 404);
    const identity_exists = await this.identity_repository.find_by_id(user_id);
    if (!identity_exists) throw new AppError('Credenciais inválidas', 400);
    const profile_exists = await this.profile_repository.find_user_id(
      identity_exists.id,
    );
    if (!profile_exists) throw new AppError('Perfil não existe', 404);
    const entity_membership_exists =
      await this.entity_membership_repository.find_one(
        info_entity.id,
        profile_exists.id,
      );
    if (!entity_membership_exists)
      throw new AppError('Usuário não pertence a essa organização', 404);
    const actor_can_update =
      roles_auth.includes(MemberRole.ADMINISTRADOR) ||
      roles_auth.includes(MemberRole.RECEPCIONISTA);
    if (!actor_can_update) {
      throw new AppError(
        'Usuário não tem permissão para mudar esse perfil',
        400,
      );
    }
    const identity = new Identity(
      {
        email: email,
        mfa_required: mfa_required,
        status: status,
        is_superuser: identity_exists.is_superuser,
        last_login_at: identity_exists.last_login_at,
        created_at: identity_exists.created_at,
      },
      identity_exists.id,
    );
    const profile = new Profile(
      {
        user_id: profile_exists.user_id,
        name: name,
        birth_date: new Date(birth_date),
        phone: phone,
        photo: photo,
        roles: roles,
        status: status,
      },
      profile_exists.id,
    );
    let entity_membership: Entity_Membership = null;
    if (entity_membership_exists.roles.includes('administrador'))
      entity_membership = new Entity_Membership({
        entity_id: entity_membership_exists.entity_id,
        profile_id: profile.id,
        roles: [...entity_membership_exists.roles, ...roles],
        status: status,
        birth_date: new Date(birth_date),
        phone: phone,
        photo: photo,
        name: name,
        profile_name: profile.name,
        entity_name: info_entity.name,
      });
    else
      entity_membership = new Entity_Membership({
        entity_id: entity_membership_exists.entity_id,
        profile_id: profile.id,
        roles: roles,
        status: status,
        birth_date: new Date(birth_date),
        phone: phone,
        photo: photo,
        name: name,
        profile_name: profile.name,
        entity_name: info_entity.name,
      });
    const prisma = this.prisma.getPrismaClient();
    try {
      await prisma.$transaction(async (tx) => {
        await this.identity_repository.update(identity, tx);
        await this.profile_repository.update(profile, tx);
        await this.entity_membership_repository.update(entity_membership, tx);
      });
    } catch (error) {
      throw new AppError(
        'Não foi possível concluir o cadastro. Tente novamente.',
        500,
      );
    }
    return entity_membership;
  }
}
