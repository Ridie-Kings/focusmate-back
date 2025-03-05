import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsOptional,
  IsMongoId, 
  IsArray, 
  ArrayUnique 
} from 'class-validator';

export class CreateGamificationProfileDto {
  @ApiProperty({description: 'ID of the user associated with the profile', example: '60f7b3b4b3f4f0001f000001'})
  @IsNotEmpty()
  @IsMongoId()
  user: string; // ID del usuario asociado

  // Para las directRewards, se espera un array de IDs de Reward
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  directRewards?: string[];

  // Para los badges desbloqueados, se espera un array de IDs de Badge
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  unlockedBadges?: string[];
}
