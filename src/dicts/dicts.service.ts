import { Injectable } from '@nestjs/common';
import { CreateDictDto } from './dto/create-dict.dto';
import { UpdateDictDto } from './dto/update-dict.dto';

@Injectable()
export class DictsService {
  create(ownerId: string, createDictDto: CreateDictDto) {
    return 'This action adds a new dict';
  }

  findAll(ownerId: string) {
    return `This action returns all dicts`;
  }

  findOne(term: string) {
    return `This action returns a #${term} dict`;
  }

  update(id: string, updateDictDto: UpdateDictDto) {
    return `This action updates a #${id} dict`;
  }

  remove(id: string) {
    return `This action removes a #${id} dict`;
  }
}
