import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateDictDto, UpdateDictDto, AddWordDto, UpdateUserSharedWithDto } from "./dto/index";
import { Dict, Word } from "./entities/dict.entity";
import { InjectModel } from "@nestjs/mongoose";
import { isValidObjectId, Model } from "mongoose";

//TODO: Implement the DictsService
@Injectable()
export class DictsService {
  constructor(
    @InjectModel(Dict.name)
    private readonly dictModel: Model<Dict>,
  ) {}

  async create(ownerId: string, createDictDto: CreateDictDto): Promise<Dict> {
    try {
      const dict = new this.dictModel({
        ...createDictDto,
        ownerId: ownerId,
      });
      return dict;
    } catch (error) {
      throw new InternalServerErrorException("Error creating dict");
    }
  }

  async findAll(ownerId: string): Promise<Dict[]> {
    const query: any = {
      $or: [{ ownerId: ownerId }, { "sharedWith.userId": ownerId }],
    };
    return this.dictModel.find(query);
  }

  // async findAllPublic(): Promise<Dict[]> {
  //   return this.dictModel.find({ public: true, isDeleted: false });
  // }

  async findOne(id: string, userId: string): Promise<Dict> {
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

  async update(id: string, updateDictDto: UpdateDictDto, userId: string): Promise<Dict> {
    const updDict = await this.findOne(id, userId);
    if (!updDict) throw new NotFoundException(`Dict not found`);
    const isOwner = updDict.ownerId === userId;
    if (!isOwner) throw new ForbiddenException(`Unauthorized access, you can not update this dict`);
    try {
      const updateDict = await this.dictModel.findByIdAndUpdate(id,
        {
          $set: {name: updateDictDto.name, description: updateDictDto.description, public: updateDictDto.public},
          $push: {tags: { $each: updateDictDto.tags }},
          $pull: {tags: { $in: updateDictDto.deleteTags } },
        },
        {new: true});
      return updateDict;
    } catch (error) {
      throw new InternalServerErrorException("Error updating dict");
    }
  }

  async updateUsersDict(id: string, updateUserSharedWithDto: UpdateUserSharedWithDto, userId: string): Promise<Dict> {
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

  async addWord(id: string, addWordDto: AddWordDto, userId: string): Promise<Dict> {
    const updDict = await this.findOne(id, userId);
    if (!updDict) throw new NotFoundException(`Dict not found`);
    const isOwner = updDict.ownerId === userId;
    if (!isOwner) throw new ForbiddenException(`Unauthorized access, you can not update this dict`);
    try {
      const word = {word: addWordDto.word, definition: addWordDto.meaning, example: addWordDto.example};
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

  async deleteWord(id: string, word: String, userId: string): Promise<Dict> {
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


  async softDelete(id: string, userId: string): Promise<Dict> {
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
  
  async remove(id: string, userId: string): Promise<Dict> {
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
