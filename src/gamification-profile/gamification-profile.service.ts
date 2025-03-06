import { Injectable } from '@nestjs/common';
import { CreateGamificationProfileDto } from './dto/create-gamification-profile.dto';
import { UpdateGamificationProfileDto } from './dto/update-gamification-profile.dto';

@Injectable()
export class GamificationProfileService {
  create(createGamificationProfileDto: CreateGamificationProfileDto) {
    return 'This action adds a new gamificationProfile';
  }

  findAll() {
    return `This action returns all gamificationProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gamificationProfile`;
  }

  update(id: number, updateGamificationProfileDto: UpdateGamificationProfileDto) {
    return `This action updates a #${id} gamificationProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} gamificationProfile`;
  }
}
