import { Injectable } from '@nestjs/common';
import { CreateGamificationProfileDto } from './dto/create-gamification-profile.dto';
import { UpdateGamificationProfileDto } from './dto/update-gamification-profile.dto';

@Injectable()
export class GamificationProfileService {
  async create(createGamificationProfileDto: CreateGamificationProfileDto) {
    return 'This action adds a new gamificationProfile';
  }

  async findAll() {
    return `This action returns all gamificationProfile`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} gamificationProfile`;
  }

  async update(id: number, updateGamificationProfileDto: UpdateGamificationProfileDto) {
    return `This action updates a #${id} gamificationProfile`;
  }

  async remove(id: number) {
    return `This action removes a #${id} gamificationProfile`;
  }
}
