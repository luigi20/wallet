import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SubscriptionCreateDTO {
  @ApiProperty({
    description: 'ID da entidade que receberá a assinatura.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  entity_id: string;

  @ApiProperty({
    description: 'ID do plano contratado.',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  plan_id: string;
}
