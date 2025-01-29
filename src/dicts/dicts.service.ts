import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDictDto, UpdateDictDto, AddWordDto, UpdateWordDto } from './dto';
import { Dict } from './entities/dict.entity';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

//TODO: Implement the DictsService
@Injectable()
export class DictsService {

  constructor(
    @InjectModel(Dict.name)
    private readonly dictModel: Model<Dict>,
  ){}
  
  async create(ownerId: string, createDictDto: CreateDictDto) {
    const dict = new this.dictModel({...createDictDto, ownerId});
    return dict;
  }

  async findMine(ownerId: string): Promise<Dict[]> {
    return this.dictModel.find({
     $or: [
      { ownerId: ownerId },
      { "sharedWith.userId": ownerId },
     ],
    });
  }

  async findAll(): Promise<Dict[]> {
    return this.dictModel.find();
  }

  async findOne(term: string): Promise<Dict> {
    let dict: Dict;
    if (!dict || isValidObjectId(term)) {
      dict = await this.dictModel.findOne({term});
    }
    if (!dict) {
      dict = await this.dictModel.findOne({name: term});
    }
    if (!dict)
          throw new NotFoundException(`Dict with id, name not found`);
    return dict;
  }

  async update(id: string, updateDictDto: UpdateDictDto): Promise<Dict> {
    return null;
  }

  remove(id: string): Promise<Dict> {
    return null;
  }
}
