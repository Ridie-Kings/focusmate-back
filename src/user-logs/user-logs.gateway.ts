import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { UserLogsService } from './user-logs.service';
import { CreateUserLogDto } from './dto/create-user-log.dto';
import { UpdateUserLogDto } from './dto/update-user-log.dto';

@WebSocketGateway()
export class UserLogsGateway {
  constructor(private readonly userLogsService: UserLogsService) {}

  @SubscribeMessage('createUserLog')
  create(@MessageBody() createUserLogDto: CreateUserLogDto) {
    return this.userLogsService.create(createUserLogDto);
  }

  @SubscribeMessage('findAllUserLogs')
  findAll() {
    return this.userLogsService.findAll();
  }

  @SubscribeMessage('findOneUserLog')
  findOne(@MessageBody() id: number) {
    return this.userLogsService.findOne(id);
  }

  @SubscribeMessage('updateUserLog')
  update(@MessageBody() updateUserLogDto: UpdateUserLogDto) {
    return this.userLogsService.update(updateUserLogDto.id, updateUserLogDto);
  }

  @SubscribeMessage('removeUserLog')
  remove(@MessageBody() id: number) {
    return this.userLogsService.remove(id);
  }
}
