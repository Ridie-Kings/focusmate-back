import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import * as sanitizeHtml from 'sanitize-html';
import { CreateDictDto, UpdateDictDto, AddWordDto, UpdateUserSharedWithDto } from "./dto/index";
import { Dict, Word } from "./entities/dict.entity";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { isValidObjectId, Model } from "mongoose";

//TODO: Implement the DictsService
@Injectable()
export class DictsService {
  constructor(
    @InjectModel(Dict.name)
    private readonly dictModel: Model<Dict>,
  ) {}

  async create(ownerId: mongoose.Types.ObjectId, createDictDto: CreateDictDto): Promise<Dict> {
    try {
      createDictDto.description = sanitizeHtml(createDictDto.description);
      const dict = new this.dictModel({
        ...createDictDto,
        ownerId,
      });
      return dict;
    } catch (error) {
      throw new InternalServerErrorException("Error creating dict");
    }
  }

  async findAll(ownerId: mongoose.Types.ObjectId): Promise<Dict[]> {
    const query: any = {
      $or: [{ ownerId: ownerId }, { "sharedWith.userId": ownerId }],
    };
    return this.dictModel.find(query).populate('ownerId');
  }

  // async findAllPublic(): Promise<Dict[]> {
  //   return this.dictModel.find({ public: true, isDeleted: false });
  // }

  async findOne(id: string, userId: mongoose.Types.ObjectId): Promise<Dict> {
    let dict: Dict;
    if (!isValidObjectId(id)) {
      dict = await this.dictModel.findById({name: id});
    }else{
      dict = await this.dictModel.findById(id);
    }
    if (!dict) throw new NotFoundException(`Dict not found`);
    const isOwner = dict.ownerId === userId;
    const isShared = dict.sharedWith.some(u => u.userId === userId);
    if (!isOwner || !isShared) throw new ForbiddenException(`Unauthorized access`);
    return dict;
  }

  async update(id: string, updateDictDto: UpdateDictDto, userId: mongoose.Types.ObjectId): Promise<Dict> {
    const updDict = await this.findOne(id, userId);
    if (!updDict) throw new NotFoundException(`Dict not found`);
    const isOwner = updDict.ownerId === userId;
    if (!isOwner) throw new ForbiddenException(`Unauthorized access, you can not update this dict`);
    try {
      const updateDict = await this.dictModel.findByIdAndUpdate(id,
        {
          $set: {name: updateDictDto.name, description: sanitizeHtml(updateDictDto.description), public: updateDictDto.public},
          $push: {tags: { $each: updateDictDto.tags }},
          $pull: {tags: { $in: updateDictDto.deleteTags } },
        },
        {new: true});
      return updateDict;
    } catch (error) {
      throw new InternalServerErrorException("Error updating dict");
    }
  }

  async updateUsersDict(id: string, updateUserSharedWithDto: UpdateUserSharedWithDto, userId: mongoose.Types.ObjectId): Promise<Dict> {
    const updDict = await this.findOne(id, userId);
    if (!updDict) throw new NotFoundException(`Dict not found`);
    const isOwner = updDict.ownerId === userId;
    if (!isOwner) throw new ForbiddenException(`Unauthorized access, you can not update this dict`);
    try {
      const updateDict = await this.dictModel.findByIdAndUpdate(id,
        {
          $addToSet: {sharedWith: { $each: updateUserSharedWithDto.sharedWith }},
          $pull: {sharedWith: { userId: { $in: updateUserSharedWithDto.deleteSharedWith } } },
        },
        {new: true});
      return updateDict;
    } catch (error) {
      throw new InternalServerErrorException("Error updating dict");
    }
  }

  async addWord(id: string, addWordDto: AddWordDto, userId: mongoose.Types.ObjectId): Promise<Dict> {
    const updDict = await this.findOne(id, userId);
    if (!updDict) throw new NotFoundException(`Dict not found`);
    const isOwner = updDict.ownerId === userId;
    if (!isOwner) throw new ForbiddenException(`Unauthorized access, you can not update this dict`);
    try {
      const word = {word: sanitizeHtml(addWordDto.word), definition: sanitizeHtml( addWordDto.meaning), example: sanitizeHtml(addWordDto.example)};
      const updateDict = await this.dictModel.findByIdAndUpdate(id,
        {
          $addToSet: { words: word },
        },
        {new: true});
      return updateDict;
    } catch (error) {
      throw new InternalServerErrorException("Error updating dict / adding word");
    }
  }

  async deleteWord(id: string, word: String, userId: mongoose.Types.ObjectId): Promise<Dict> {
    const updDict = await this.findOne(id, userId);
    if (!updDict) throw new NotFoundException(`Dict not found`);
    const isOwner = updDict.ownerId === userId;
    if (!isOwner) throw new ForbiddenException(`Unauthorized access, you can not update this dict`);
    try {
      return await this.dictModel.findByIdAndUpdate(id,
        {
          $pull: { words: {word: word} },
        },
        {new: true});
    } catch (error) {
      throw new InternalServerErrorException("Error updating dict / deleting word");
    }
  }


  async softDelete(id: string, userId: mongoose.Types.ObjectId): Promise<Dict> {
    const dict = await this.findOne(id, userId);
    if (!dict) throw new NotFoundException(`Dict not found`);
    const isOwner = dict.ownerId === userId;
    if (!isOwner) throw new ForbiddenException(`Unauthorized access, you can not delete this dict`);
    try {
      dict.isDeleted = true;
      return await dict.save();
    } catch (error) {
      throw new InternalServerErrorException("Error deleting dict");
    }
  }
  
  async remove(id: string, userId: mongoose.Types.ObjectId): Promise<Dict> {
    const dict = await this.findOne(id, userId);
    if (!dict) throw new NotFoundException(`Dict not found`);
    const isOwner = dict.ownerId === userId;
    if (!isOwner) throw new ForbiddenException(`Unauthorized access, you can not delete this dict`);
    try {
      return await this.dictModel.findByIdAndDelete(id);
    } catch (error) {
      throw new InternalServerErrorException("Error deleting dict");
    }
  }
}

