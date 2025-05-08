import { forwardRef, Module } from '@nestjs/common';
import { UserLogsService } from './user-logs.service';
// import { UserLogsGateway } from './user-logs.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserLog, UserLogSchema } from './entities/user-log.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { PomodoroModule } from 'src/pomodoro/pomodoro.module';
import { UserLogsController } from './user-logs.controller';
import { Pomodoro, PomodoroSchema } from 'src/pomodoro/entities/pomodoro.entity';

@Module({
  providers: [UserLogsService],
  controllers: [UserLogsController],
  imports: [
    MongooseModule.forFeature([
      { name: UserLog.name, schema: UserLogSchema },
      { name: Pomodoro.name, schema: PomodoroSchema }
    ]), 
    AuthModule, 
    UsersModule, 
    PomodoroModule
  ],
  exports: [UserLogsService]
})
export class UserLogsModule {}
