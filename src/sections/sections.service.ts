import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Section, SectionDocument } from './entities/section.entity';

@Injectable()
export class SectionsService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
  ){}

  async create(createSectionDto: CreateSectionDto, userId: mongoose.Types.ObjectId): Promise<SectionDocument> {
    try {
      return await this.sectionModel.create({
        ...createSectionDto,
        userId,
      });
    }
    catch (error) {
      throw new InternalServerErrorException('Error creating section');
    }
  }

  async findAll( userId: mongoose.Types.ObjectId): Promise<SectionDocument[]> {
    try {
      return await this.sectionModel.find({userId: userId});
    } catch (error) {
      throw new InternalServerErrorException('Error getting sections');
    }
  }

  async findOne(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<SectionDocument> {
    try {
      const section = await this.sectionModel.findById(id);
      if (!section) throw new NotFoundException('Section not found');
      if (!section.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      return (await section.populate('userId')).populate('tasks');
    } catch (error) {
      throw new InternalServerErrorException('Error getting section');
    }
  }

  async update(id: mongoose.Types.ObjectId, updateSectionDto: UpdateSectionDto, userId: mongoose.Types.ObjectId): Promise<SectionDocument> {
    try {
      const section = await this.sectionModel.findById(id);
      if (!section) throw new NotFoundException('Section not found');
      if (!section.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      await this.sectionModel.findByIdAndUpdate(id, {
        $set: {name: updateSectionDto.name, description: updateSectionDto.description, order: updateSectionDto.order, category: updateSectionDto.category},
      },
      { new: true });
      if (updateSectionDto.tags.length || updateSectionDto.deleteTags.length) {
        return await this.updateTags(id, updateSectionDto, userId);
      }
      if (updateSectionDto.tasks.length || updateSectionDto.deleteTasks.length) {
        return await this.updateTasks(id, updateSectionDto, userId);
      }
      if (updateSectionDto.addSubSections.length || updateSectionDto.deleteSubSections.length) {
        return await this.updateSubSections(id, updateSectionDto, userId);
      }
      if (updateSectionDto.notes.length || updateSectionDto.deleteNotes.length) {
        return await this.updateNotes(id, updateSectionDto, userId);
      }
      return await this.sectionModel.findById(id).populate('userId').populate('tasks').populate('subSections').populate('notes');
    } catch (error) {
      throw new InternalServerErrorException('Error updating section');
    }
  }

  async updateTags(id: mongoose.Types.ObjectId, updateSectionDto: UpdateSectionDto, userId: mongoose.Types.ObjectId): Promise<SectionDocument> {
    try {
      const section = await this.sectionModel.findById(id);
      if (!section) throw new NotFoundException('Section not found');
      if (!section.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      await this.sectionModel.findByIdAndUpdate(id, {
        $push: {tags: { $each: updateSectionDto.tags }},
        $pull: {tags: { $in: updateSectionDto.deleteTags }},
      },
      { new: true });
      return (await this.findOne(id, userId)).populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error updating section');
    }
  }

  async remove(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<SectionDocument> {
    try {
      const section = await this.sectionModel.findById(id);
      if (!section) throw new NotFoundException('Section not found');
      if (!section.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      return await this.sectionModel.findByIdAndDelete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting section');
    }
  }


}
