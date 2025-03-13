import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { Reward } from './entities/reward.entity';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import mongoose from 'mongoose';

@ApiTags('Rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reward' })
  @ApiResponse({ status: 201, description: 'Reward successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  async create(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardsService.create(createRewardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rewards' })
  @ApiResponse({ status: 200, description: 'List of rewards retrieved' })
  async findAll() {
    return this.rewardsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reward by its id' })
  @ApiResponse({ status: 200, description: 'Reward retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  async findOne(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId) {
    return this.rewardsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reward by its id' })
  @ApiResponse({ status: 200, description: 'Reward updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  async update(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, @Body() updateRewardDto: UpdateRewardDto) {
    return this.rewardsService.update(id, updateRewardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reward by its id' })
  @ApiResponse({ status: 200, description: 'Reward deleted successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  async remove(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId) {
    return this.rewardsService.remove(id);
  }
}
