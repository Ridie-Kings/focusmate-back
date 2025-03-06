import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Badge } from './entities/badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectModel(Badge.name)
    private readonly badgeModel: Model<Badge>,
  ) {}
  
  async create(createBadgeDto: CreateBadgeDto): Promise<Badge> {
    try {
      return (await this.badgeModel.create(createBadgeDto)).populate('reward');
    } catch (error) {
      throw new InternalServerErrorException('Error creating badge');
    }
  }

  async findAll(): Promise<Badge[]> {
    return this.badgeModel.find().populate('reward');
  }

  async findOne(id: mongoose.Types.ObjectId): Promise<Badge> {
    return this.badgeModel.findById(id).populate('reward');
  }

  async update(id: mongoose.Types.ObjectId, updateBadgeDto: UpdateBadgeDto): Promise<Badge> {
    try {
      return (await this.badgeModel.findByIdAndUpdate(id, updateBadgeDto, {new: true})).populate('reward');
    } catch (error) {
      throw new InternalServerErrorException('Error updating badge'); 
    }
  }

  async remove(id: mongoose.Types.ObjectId): Promise<Badge> {
    try {
      return (await this.badgeModel.findByIdAndDelete(id));
    } catch (error) {
      throw new InternalServerErrorException('Error deleting badge');
    }
  }

  async findByName(name: string): Promise<Badge> {
    try {
      return this.badgeModel.findOne({name}).populate('reward');
    } catch (error) {
      throw new InternalServerErrorException('Error finding badge by name');
    }
  }
}