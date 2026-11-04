import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '@modules/auth/profile/shared/repositories/abstract_class/iprofile-repository';
import { IEntityRepository } from '@modules/auth/entity/shared/repositories/abstract_class/ientity-repository';
import { AppError } from '@modules/utils/app_error';
import { IIdentityRepository } from '@modules/auth/user/shared/repositories/abstract_class/IUser-repository';
import { Identity } from '@modules/auth/user/shared/models/user';
import { userPasswordValidator } from '@modules/utils/functions';
import argon2 from 'argon2';
import { Profile } from '@modules/auth/profile/shared/models/profile';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { IEntityMembershipRepository } from '@modules/business/entity_membership/shared/repositories/abstract_class/ientitymembership-repository';
import { Entity_Membership } from '@modules/business/entity_membership/shared/models/entity_membership';
import { Identity_Credential } from '@modules/auth/identity_credential/shared/models/identity_credential';
import { IIdentityCredentialRepository } from '@modules/auth/identity_credential/shared/repositories/abstract_class/iidentitycredential-repository';

interface IMembersRequest {
  entity_id: string;
  email: string;
  password: string;
  mfa_required: boolean;
  name: string;
  phone: string;
  photo: string;
  birth_date: string;
  roles: string[];
}

@Injectable()
export class EntityMembershipCreateService {
  constructor(
    private readonly entity_membership_repository: IEntityMembershipRepository,
    private readonly profile_repository: IProfileRepository,
    private readonly entity_repository: IEntityRepository,
    private readonly identity_repository: IIdentityRepository,
    private readonly prisma: PrismaService,
    private readonly identity_credential_repository: IIdentityCredentialRepository,
  ) {}

  public async execute({
    birth_date,
    email,
    mfa_required,
    name,
    password,
    phone,
    photo,
    roles,
    entity_id,
  }: IMembersRequest): Promise<Entity_Membership> {
    const password_validator = userPasswordValidator();
    const errors = password_validator.validate(password, { list: true });
    if (Array.isArray(errors) && errors.length > 0)
      throw new AppError('Senha inválida', 400);
    const info_entity =
      await this.entity_repository.findByIdSelectIdAndName(entity_id);
    if (!info_entity) throw new AppError('Empresa não existe', 404);
    const identity_exists = await this.identity_repository.find_by_email(
      email.toLowerCase().trim(),
    );
    let entity_membership: Entity_Membership = null;
    if (!identity_exists) {
      const password_hash = await argon2.hash(password);
      const identity = new Identity({
        email: email,
        mfa_required: mfa_required,
        status: 'ativo',
        is_superuser: false,
      });
      const identity_credential = new Identity_Credential({
        user_id: identity.id,
        provider: 'local',
        password_hash: password_hash,
      });
      const profile = new Profile({
        user_id: identity.id,
        name: name,
        birth_date: new Date(birth_date),
        phone: phone,
        photo: photo,
        status: 'ativo',
      });
      entity_membership = new Entity_Membership({
        entity_id: entity_id,
        profile_id: profile.id,
        roles: roles,
        status: 'ativo',
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
          await this.identity_repository.create(identity, tx);
          await this.profile_repository.create(profile, tx);
          await this.entity_membership_repository.create(entity_membership, tx);
          await this.identity_credential_repository.create(
            identity_credential,
            tx,
          );
        });
      } catch (error) {
        throw new AppError(
          'Não foi possível concluir o cadastro. Tente novamente.',
          500,
        );
      }
    } else {
      const profile = await this.profile_repository.find_user_id(
        identity_exists.id,
      );
      if (!profile) return;
      const entity_membership_exists =
        await this.entity_membership_repository.find_one(entity_id, profile.id);
      if (
        entity_membership_exists?.roles?.includes('administrador') ||
        entity_membership_exists?.roles?.includes('recepcionista')
      )
        entity_membership = new Entity_Membership({
          entity_id: entity_id,
          profile_id: profile.id,
          roles: [...entity_membership_exists.roles, ...roles],
          status: 'ativo',
          birth_date: new Date(birth_date),
          phone: phone,
          photo: photo,
          name: name,
          profile_name: profile.name,
          entity_name: info_entity.name,
        });
      else
        entity_membership = new Entity_Membership({
          entity_id: entity_id,
          profile_id: profile.id,
          roles: roles,
          status: 'ativo',
          birth_date: new Date(birth_date),
          phone: phone,
          photo: photo,
          name: name,
          profile_name: profile.name,
          entity_name: info_entity.name,
        });
      if (entity_membership_exists?.roles?.includes('administrador'))
        await this.entity_membership_repository.update(entity_membership);
      else await this.entity_membership_repository.create(entity_membership);
    }
    return entity_membership;
  }
}
