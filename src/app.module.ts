import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HabitController } from './habit/habit.controller';

@Module({
  imports: [],
  controllers: [AppController, HabitController],
  providers: [AppService],
})
export class AppModule {}
