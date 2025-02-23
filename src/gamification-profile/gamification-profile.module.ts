import { Module } from '@nestjs/common';
import { GamificationProfileService } from './gamification-profile.service';
import { GamificationProfileController } from './gamification-profile.controller';

@Module({
  controllers: [GamificationProfileController],
  providers: [GamificationProfileService],
})
export class GamificationProfileModule {}
