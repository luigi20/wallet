import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class EntityCustomerCreateDTO {
  @ApiProperty({
    description: 'Data de nascimento do cliente.',
    example: '1995-05-20',
  })
  @IsString()
  birth_date: string;

  @ApiProperty({
    description: 'E-mail do cliente.',
    example: 'cliente@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'ID da entidade à qual o cliente será vinculado.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  entity_id: string;

  @ApiProperty({
    description: 'Define se o cliente deverá utilizar MFA.',
    example: false,
  })
  @IsBoolean()
  mfa_required: boolean;

  @ApiProperty({
    description: 'Nome completo do cliente.',
    example: 'João da Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Senha inicial do cliente.',
    example: 'Senha@123456',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Telefone do cliente.',
    example: '+5579999999999',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'URL da foto do cliente.',
    example: 'https://ik.imagekit.io/seu_usuario/profile.jpg',
  })
  @IsString()
  photo: string;

  @ApiProperty({
    description: 'Observações sobre o cliente.',
    example: 'Cliente prefere atendimento pela manhã.',
  })
  @IsString()
  notes: string;
}
