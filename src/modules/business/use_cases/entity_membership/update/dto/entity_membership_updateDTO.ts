import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsArray, IsBoolean, IsEmail, IsString } from 'class-validator';

import { MemberRole, MembershipStatus } from '@modules/utils/enum';

export class EntityMembershipUpdateDTO {
  @ApiProperty({
    description: 'Data de nascimento do membro.',
    example: '1995-05-20',
  })
  @IsString()
  birth_date: string;

  @ApiProperty({
    description: 'E-mail do membro.',
    example: 'funcionario@barbearia.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'ID da entidade.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  entity_id: string;

  @ApiProperty({
    description: 'ID da identidade do membro.',
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    description: 'Define se o membro necessita de MFA.',
    example: true,
  })
  @IsBoolean()
  mfa_required: boolean;

  @ApiProperty({
    description: 'Nome completo do membro.',
    example: 'João da Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Telefone do membro.',
    example: '+5579999999999',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'URL da foto do membro.',
    example: 'https://ik.imagekit.io/seu_usuario/profile.jpg',
  })
  @IsString()
  photo?: string;

  @ApiProperty({
    description: 'Roles do membro.',
    enum: MemberRole,
    isArray: true,
    example: [MemberRole.BARBEIRO],
  })
  @IsArray()
  roles: MemberRole[];

  @ApiProperty({
    description: 'Status atual do vínculo do membro.',
    enum: MembershipStatus,
    example: MembershipStatus.ATIVO,
  })
  @IsString()
  status: MembershipStatus;
}
