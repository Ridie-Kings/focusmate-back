import { Module } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Avatar, AvatarSchema } from './entities/avatar.entity';

@Module({
  controllers: [AvatarsController],
  providers: [AvatarsService],
  exports: [AvatarsService],
  imports: [MongooseModule.forFeature([{ name: Avatar.name, schema: AvatarSchema }])],
})
export class AvatarsModule {}
