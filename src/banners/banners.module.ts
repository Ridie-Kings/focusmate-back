import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './entities/banner.entity';


@Module({
  controllers: [BannersController],
  providers: [BannersService],
  imports: [MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }])],
  exports: [BannersService],
})
export class BannersModule {}
