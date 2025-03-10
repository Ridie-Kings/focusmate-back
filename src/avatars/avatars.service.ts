import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { Avatar } from './entities/avatar.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class AvatarsService {

  constructor(
    @InjectModel(Avatar.name)
    private readonly avatarModel: Model<Avatar>,
  ) {}
  async create(createAvatarDto: CreateAvatarDto, userId: mongoose.Types.ObjectId): Promise<Avatar> {
    try {
      const avatar = await this.avatarModel.create({
        ...createAvatarDto,
        userId,
      });
      return await avatar.populate('userId');
    } catch (error) {
      throw new InternalServerErrorException("Error creating avatar");
    }
  }

  async findAll(userId: mongoose.Types.ObjectId): Promise<Avatar[]> {
    const query: any = {
      $or: [{ userId: userId }, {userId: null}, {userId:{ $exists: false }}],
    };
    return this.avatarModel.find(query);
  }

  async findOne(id: string, userId: mongoose.Types.ObjectId): Promise<Avatar> {
    let avatar: Avatar;
    avatar = await this.avatarModel.findById(id);
    if (!avatar) throw new NotFoundException(`Avatar not found`);
    if (!avatar.userId.equals(userId) && avatar.userId) {
      throw new ForbiddenException(`Unauthorized access`);
    }
    return avatar;
  }

  async findUsersAvatars(userId: mongoose.Types.ObjectId): Promise<Avatar[]> {
    return this.avatarModel.find({ userId });
  }
  
  async findSystemAvatars(): Promise<Avatar[]> {
    return this.avatarModel.find({ $or: [{userId: null}, {userId: { $exists: false }}] });
  }
  
  async update(id: string, updateAvatarDto: UpdateAvatarDto, userId: mongoose.Types.ObjectId): Promise<Avatar> {
    const updAvatar = await this.avatarModel.findById(id);
    if (!updAvatar) throw new NotFoundException(`Avatar not found`);
    if (updAvatar.userId.equals(userId)) { 
      throw new ForbiddenException(`Unauthorized access, you can not update this avatar`);
    }
    try {
      return await this.avatarModel.findByIdAndUpdate(id, updateAvatarDto, {new: true});
    } catch (error) {
      throw new InternalServerErrorException("Error updating avatar");
    } 
  }

  async softDelete(id: string, userId: mongoose.Types.ObjectId): Promise<Avatar> {
    const avatar = await this.avatarModel.findById(id);
    if (!avatar) throw new NotFoundException(`Avatar not found`);
    if (avatar.userId.equals(userId)) {
      throw new ForbiddenException(`Unauthorized access`);
    }
    try {
      return await this.avatarModel.findByIdAndUpdate(id, {isDeleted: true}, {new: true});
    }
    catch (error) {
      throw new InternalServerErrorException("Error deleting avatar");
    }
  }

  // async remove(id: string): Promise<Avatar> {
  //   const avatar = await this.avatarModel.findById(id);
  //   if (!avatar) throw new NotFoundException(`Avatar not found`);
  //   if (avatar.userId.equals(userId)) {
  //     throw new ForbiddenException(`Unauthorized access`);
  //   }
  //   try {
  //     return await this.avatarModel.findByIdAndUpdate(id, {isDeleted: true}, {new: true});
  //   }
  //   catch (error) {
  //     throw new InternalServerErrorException("Error deleting avatar");
  //   }
  // }
}
