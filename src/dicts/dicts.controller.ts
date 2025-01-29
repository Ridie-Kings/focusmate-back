import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DictsService } from './dicts.service';
import { CreateDictDto } from './dto/create-dict.dto';
import { UpdateDictDto } from './dto/update-dict.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('dicts')
@UseGuards(JwtAuthGuard)
export class DictsController {
  constructor(private readonly dictsService: DictsService) {}

  @Post()
  async create(@Req() req, @Body() createDictDto: CreateDictDto) {
    return this.dictsService.create(req.user.userId, createDictDto);
  }

  @Get()
  async findAll(@Req() req) {
    return this.dictsService.findAll(req.user.userId);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.dictsService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDictDto: UpdateDictDto) {
    return this.dictsService.update(+id, updateDictDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dictsService.remove(+id);
  }
}
