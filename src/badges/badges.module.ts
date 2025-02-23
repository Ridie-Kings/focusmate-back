import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Badge, BadgeSchema } from './entities/badge.entity';

@Module({
  controllers: [BadgesController],
  providers: [BadgesService],
  imports: [
    MongooseModule.forFeature([{ name: Badge.name, schema: BadgeSchema }]),
  ],
  exports: [BadgesService],
})
export class BadgesModule {}
