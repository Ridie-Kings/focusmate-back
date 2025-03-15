import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import mongoose from 'mongoose';

@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  create(@Body() createQuestDto: CreateQuestDto) {
    return this.questsService.create(createQuestDto);
  }

  @Get()
  findAll() {
    return this.questsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId) {
    return this.questsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, @Body() updateQuestDto: UpdateQuestDto) {
    return this.questsService.update(id, updateQuestDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId) {
    return this.questsService.remove(id);
  }
}
