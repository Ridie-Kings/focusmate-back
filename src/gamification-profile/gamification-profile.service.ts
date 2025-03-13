import { Injectable } from '@nestjs/common';
import { CreateGamificationProfileDto } from './dto/create-gamification-profile.dto';
import { UpdateGamificationProfileDto } from './dto/update-gamification-profile.dto';
import mongoose from 'mongoose';

@Injectable()
export class GamificationProfileService {
  async create(createGamificationProfileDto: CreateGamificationProfileDto) {
    return 'This action adds a new gamificationProfile';
  }

  async findAll() {
    return `This action returns all gamificationProfile`;
  }

  async findOne(id: mongoose.Types.ObjectId) {
    return `This action returns a #${id} gamificationProfile`;
  }

  async update(id: mongoose.Types.ObjectId, updateGamificationProfileDto: UpdateGamificationProfileDto) {
    return `This action updates a #${id} gamificationProfile`;
  }

  async remove(id: mongoose.Types.ObjectId) {
    return `This action removes a #${id} gamificationProfile`;
  }
}
