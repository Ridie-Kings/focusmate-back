import { Module } from '@nestjs/common';
import { UserLogsService } from './user-logs.service';
import { UserLogsGateway } from './user-logs.gateway';

@Module({
  providers: [UserLogsGateway, UserLogsService],
})
export class UserLogsModule {}
