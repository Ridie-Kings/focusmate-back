import { Module } from '@nestjs/common';
import { GamificationProfileService } from './gamification-profile.service';
import { GamificationProfileController } from './gamification-profile.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationProfile, GamificationProfileSchema } from './entities/gamification-profile.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: GamificationProfile.name, schema: GamificationProfileSchema }])],
  controllers: [GamificationProfileController],
  providers: [GamificationProfileService, GamificationProfileGateway],
  exports: [GamificationProfileService],
})
export class GamificationProfileModule {}
