import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DictsService } from './dicts.service';
import { CreateDictDto } from './dto/create-dict.dto';
import { UpdateDictDto } from './dto/update-dict.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { Dict } from './entities/dict.entity';

@Controller('dicts')
@UseGuards(JwtAuthGuard)
export class DictsController {
  constructor(private readonly dictsService: DictsService) {}

  @Post()
  async create(@Req() req, @Body() createDictDto: CreateDictDto): Promise<Dict>{
    return this.dictsService.create(req.user.userId, createDictDto);
  }

  @Get()
  async findAll(@Req() req): Promise<Dict[]> {
    return this.dictsService.findMine(req.user.userId);
  }

  @Get('all')
  async findAllPublic(): Promise<Dict[]> {
    return this.dictsService.findAll();
  }

  @Get(':term')
  async findOne(@Param('term') term: string): Promise<Dict> {
    return this.dictsService.findOne(term);
  }

  @Patch(':id')
  async update(@Param('id', ParseMongoIdPipe) id: string, @Body() updateDictDto: UpdateDictDto): Promise<Dict>{
    return this.dictsService.update(id, updateDictDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseMongoIdPipe) id: string): Promise<Dict>{
    return this.dictsService.remove(id);
  }
}
