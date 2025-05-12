import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserLogsService } from './user-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import mongoose from 'mongoose';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/users/decorators/get-user.decorator';

@ApiTags('user-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-logs')
export class UserLogsController {
  constructor(private readonly userLogsService: UserLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user logs'})
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the user logs including activity history, counts, and timestamps' 
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async getUserLogs(@GetUser() user: User) {
    return await this.userLogsService.getUserLogs(user.id);
  }


  @Get('pomodoroTime')
  @ApiOperation({ summary: 'Get pomodoro time'})
  @ApiResponse({
    status: 200,
    description: 'Returns the pomodoro time'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async getPomodoroTime(@GetUser() user: User) {
    return await this.userLogsService.getPomodoroTime(user.id);
  }

  @Get('streak')
  @ApiOperation({ summary: 'Get streak'})
  @ApiResponse({
    status: 200,
    description: 'Returns the streak'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async getStreak(@GetUser() user: User) {
    return await this.userLogsService.getStreak(user.id);
  }

  // @Get(':userId/activity')
  // @ApiOperation({ summary: 'Get user activity logs with filtering' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Returns filtered activity logs for the user' 
  // })
  // async getUserActivity(
  //   @Param('userId') userId: string,
  //   @Query('type') type?: string,
  //   @Query('startDate') startDate?: string,
  //   @Query('endDate') endDate?: string,
  //   @Query('limit') limit: number = 50
  // ) {
  //   const query: any = {
  //     userId: new mongoose.Types.ObjectId(userId)
  //   };

  //   if (type) {
  //     query['logs.type'] = type;
  //   }

  //   if (startDate || endDate) {
  //     query['logs.dateLog'] = {};
  //     if (startDate) {
  //       query['logs.dateLog'].$gte = new Date(startDate);
  //     }
  //     if (endDate) {
  //       query['logs.dateLog'].$lte = new Date(endDate);
  //     }
  //   }

  //   return await this.userLogsService.getFilteredLogs(query, limit);
  // }

  // @Get(':userId/stats')
  // @ApiOperation({ summary: 'Get user activity statistics' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Returns user activity statistics including counts and durations' 
  // })
  // async getUserStats(@Param('userId') userId: string) {
  //   return await this.userLogsService.getUserStats(new mongoose.Types.ObjectId(userId));
  // }

  // @Get('admin/recent-activity')
  // @ApiOperation({ summary: 'Get recent activity across all users (Admin only)' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Returns recent activity logs across all users' 
  // })
  // async getRecentActivity(
  //   @Query('limit') limit: number = 50,
  //   @Query('type') type?: string
  // ) {
  //   return await this.userLogsService.getRecentActivity(limit, type);
  // }
}
