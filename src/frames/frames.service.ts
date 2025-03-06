import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Frame } from './entities/frame.entity'; // Add this line to import Frame
import { Model, Mongoose } from 'mongoose';

@Injectable()
export class FramesService {

  constructor(
    @InjectModel(Frame.name)
    private readonly frameModel: Model<Frame>
  ) {}

  async findAll(): Promise<Frame[]> {
    return this.frameModel.find();
  }

  async findOne(id: string): Promise<Frame>{
    try {
      const frame = await this.frameModel.findById(id);
      if (!frame) {
        throw new NotFoundException('Frame not found');
      }
      return frame;
    } catch (error) {
      throw new InternalServerErrorException('Error finding frame');
    }
  }
}
