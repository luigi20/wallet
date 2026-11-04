import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EntityUpdateDTO {
  @ApiProperty({
    description: 'Status atual da entidade.',
    example: 'ACTIVE',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Documento da entidade.',
    example: '12345678000199',
  })
  @IsString()
  document: string;

  @ApiProperty({
    description: 'E-mail da entidade.',
    example: 'contato@barbearia.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Telefone da entidade.',
    example: '+5579999999999',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Nome da entidade.',
    example: 'Barbearia do Luís',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL da foto da entidade.',
    example: 'https://ik.imagekit.io/seu_usuario/barbearia.jpg',
  })
  @IsString()
  photo: string;

  @ApiProperty({
    description: 'Tipo da entidade.',
    example: 'BARBERSHOP',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'CEP do endereço da entidade.',
    example: '49000-000',
  })
  @IsString()
  zip_code: string;

  @ApiProperty({
    description: 'Rua do endereço da entidade.',
    example: 'Rua João Pessoa',
  })
  @IsString()
  street: string;

  @ApiProperty({
    description: 'Número do endereço da entidade.',
    example: '123',
  })
  @IsString()
  number: string;

  @ApiProperty({
    description: 'Complemento do endereço da entidade.',
    example: 'Sala 2',
    required: false,
  })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({
    description: 'Bairro do endereço da entidade.',
    example: 'Centro',
  })
  @IsString()
  neighborhood: string;

  @ApiProperty({
    description: 'Cidade do endereço da entidade.',
    example: 'Aracaju',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Estado do endereço da entidade.',
    example: 'SE',
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'País do endereço da entidade.',
    example: 'BR',
  })
  @IsString()
  country: string;
}
