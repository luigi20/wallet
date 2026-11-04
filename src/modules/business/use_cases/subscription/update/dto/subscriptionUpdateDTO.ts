import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class SubscriptionUpdateDTO {
  @ApiProperty({
    description: 'ID da entidade vinculada à assinatura.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  entity_id: string;

  @ApiProperty({
    description: 'ID do plano da assinatura.',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  plan_id: string;

  @ApiProperty({
    description: 'Status atual da assinatura.',
    example: 'ativo',
  })
  @IsString()
  status: string;
}
