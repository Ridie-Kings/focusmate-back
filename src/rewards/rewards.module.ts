import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsService } from './rewards.service';
import { RewardsGateway } from './rewards.gateway';
import { RewardsController} from './rewards.controller';
import { Reward, RewardSchema } from './entities/reward.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
  ],
  controllers: [RewardsController],
  providers: [RewardsService, RewardsGateway],
  exports: [RewardsService],
})
export class RewardsModule {}
