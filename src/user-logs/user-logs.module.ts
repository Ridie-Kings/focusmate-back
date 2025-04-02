import { Module } from '@nestjs/common';
import { UserLogsService } from './user-logs.service';
import { UserLogsGateway } from './user-logs.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [UserLogsGateway, UserLogsService],
  imports: [AuthModule],
  exports: [UserLogsService]
})
export class UserLogsModule {}
