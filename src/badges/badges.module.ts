import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Badge, BadgeSchema } from './entities/badge.entity';
import { BadgesGateway } from './badges.gateway';
import { BadgesController } from './badges.controller';

@Module({
  providers: [BadgesService, BadgesGateway],
  imports: [
    MongooseModule.forFeature([{ name: Badge.name, schema: BadgeSchema }]),
  ],
  exports: [BadgesService],
  controllers: [BadgesController],
})
export class BadgesModule {}
