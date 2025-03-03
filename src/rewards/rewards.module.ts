import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsGateway } from './rewards.gateway';

@Module({
  providers: [RewardsGateway, RewardsService],
})
export class RewardsModule {}
