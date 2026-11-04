import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsString } from 'class-validator';
import { MemberRole } from '@modules/utils/enum';

export class EntityMembershipCreateDTO {
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
    description: 'Define se o membro utilizará MFA.',
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
    description: 'Senha inicial do membro.',
    example: 'Senha@123456',
  })
  @IsString()
  password: string;

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
    description: 'Roles atribuídas ao membro.',
    enum: MemberRole,
    isArray: true,
    example: [MemberRole.BARBEIRO],
  })
  @IsArray()
  roles: MemberRole[];
}
