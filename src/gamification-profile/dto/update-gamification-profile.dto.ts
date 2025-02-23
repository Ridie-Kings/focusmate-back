import { PartialType } from '@nestjs/swagger';
import { CreateGamificationProfileDto } from './create-gamification-profile.dto';

export class UpdateGamificationProfileDto extends PartialType(CreateGamificationProfileDto) {}
