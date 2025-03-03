import { Test, TestingModule } from '@nestjs/testing';
import { RewardsGateway } from './rewards.gateway';
import { RewardsService } from './rewards.service';

describe('RewardsGateway', () => {
  let gateway: RewardsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardsGateway, RewardsService],
    }).compile();

    gateway = module.get<RewardsGateway>(RewardsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
