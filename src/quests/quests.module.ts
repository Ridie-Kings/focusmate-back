import { Module } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { QuestsController } from './quests.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [QuestsController],
  providers: [QuestsService],
  imports:[MongooseModule.forFeature([{name: Quest.name, schema: QuestSchema}]), AuthModule],
  exports: [QuestsService]
})
export class QuestsModule {}
