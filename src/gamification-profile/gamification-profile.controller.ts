import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GamificationProfileService } from './gamification-profile.service';
import { CreateGamificationProfileDto } from './dto/create-gamification-profile.dto';
import { UpdateGamificationProfileDto } from './dto/update-gamification-profile.dto';

@Controller('gamification-profile')
export class GamificationProfileController {
  constructor(private readonly gamificationProfileService: GamificationProfileService) {}

  @Post()
  create(@Body() createGamificationProfileDto: CreateGamificationProfileDto) {
    return this.gamificationProfileService.create(createGamificationProfileDto);
  }

  @Get()
  findAll() {
    return this.gamificationProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamificationProfileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGamificationProfileDto: UpdateGamificationProfileDto) {
    return this.gamificationProfileService.update(+id, updateGamificationProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamificationProfileService.remove(+id);
  }
}
