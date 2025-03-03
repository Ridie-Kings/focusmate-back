import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@WebSocketGateway()
export class RewardsGateway {
  constructor(private readonly rewardsService: RewardsService) {}

  @SubscribeMessage('createReward')
  create(@MessageBody() createRewardDto: CreateRewardDto) {
    return this.rewardsService.create(createRewardDto);
  }

  @SubscribeMessage('findAllRewards')
  findAll() {
    return this.rewardsService.findAll();
  }

  @SubscribeMessage('findOneReward')
  findOne(@MessageBody() id: number) {
    return this.rewardsService.findOne(id);
  }

  @SubscribeMessage('updateReward')
  update(@MessageBody() updateRewardDto: UpdateRewardDto) {
    return this.rewardsService.update(updateRewardDto.id, updateRewardDto);
  }

  @SubscribeMessage('removeReward')
  remove(@MessageBody() id: number) {
    return this.rewardsService.remove(id);
  }
}
