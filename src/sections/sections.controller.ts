import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SectionDocument } from './entities/section.entity';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import mongoose from 'mongoose';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Sections')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({
  whitelist: true,
  transform: true,
}),)
@UseGuards(JwtAuthGuard)
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ApiOperation({
    description: 'Create a new section',
  })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parameters were passed' })
  async create(@Body() createSectionDto: CreateSectionDto, @GetUser() user: User): Promise<SectionDocument> {
    return this.sectionsService.create(createSectionDto, user.id);
  }

  @Get()
  @ApiOperation({
    description: 'Retrieve all sections',
  })
  @ApiResponse({ status: 200, description: 'List of sections retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized access'  })
  async findAll(@GetUser() user: User): Promise<SectionDocument[]> {
    return this.sectionsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({
    description: 'Retrieve a section by ID',
  })
  @ApiResponse({ status: 200, description: 'Section retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized access'  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async findOne(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, @GetUser() user: User): Promise<SectionDocument>{
    return this.sectionsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    description: 'Update a section by ID',
  })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parameters were passed' })
  @ApiResponse({ status: 401, description: 'Unauthorized access'  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async update(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(+id, updateSectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(+id);
  }
}

//TODO: filtro y busqueda por distinto tipo
