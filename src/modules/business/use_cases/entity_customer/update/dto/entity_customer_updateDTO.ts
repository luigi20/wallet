import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class EntityCustomerUpdateDTO {
  @ApiProperty({
    example: '1995-05-20',
    description: 'Data de nascimento do cliente.',
  })
  @IsString()
  birth_date: string;

  @ApiProperty({
    example: 'cliente@email.com',
    description: 'E-mail do cliente.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID da entidade.',
  })
  @IsString()
  entity_id: string;

  @ApiProperty({
    example: true,
    description: 'Define se o cliente utiliza MFA.',
  })
  @IsBoolean()
  mfa_required: boolean;

  @ApiProperty({
    example: 'João da Silva',
    description: 'Nome do cliente.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '+5579999999999',
    description: 'Telefone do cliente.',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    example: 'https://ik.imagekit.io/seu_usuario/profile.jpg',
    description: 'URL da foto do cliente.',
  })
  @IsString()
  photo?: string;

  @ApiPropertyOptional({
    example: 'Cliente prefere atendimento pela manhã.',
    description: 'Observações sobre o cliente.',
  })
  @IsString()
  notes?: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Status do cliente.',
  })
  @IsString()
  status: string;
}
