import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PlanUpdateDTO {
  @ApiProperty({
    description: 'Define se o plano está ativo.',
    example: true,
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'Quantidade máxima de agendamentos permitidos.',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  max_appointments: number;

  @ApiProperty({
    description: 'Quantidade máxima de clientes permitidos.',
    example: 500,
  })
  @IsNumber()
  @Min(0)
  max_customers: number;

  @ApiProperty({
    description: 'Quantidade máxima de membros permitidos.',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  max_members: number;

  @ApiProperty({
    description: 'Nome do plano.',
    example: 'Plano Premium',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Preço do plano.',
    example: 99.9,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Descrição do plano.',
    example: 'Plano completo para barbearias.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
