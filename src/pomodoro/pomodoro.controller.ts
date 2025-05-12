import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { PomodoroService } from './pomodoro.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Pomodoro')
@Controller('pomodoro')
@UseGuards(JwtAuthGuard)
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a pomodoro with other users' })
  @ApiResponse({ status: 200, description: 'Pomodoro shared successfully' })
  @ApiResponse({ status: 404, description: 'Pomodoro not found' })
  async sharePomodoro(@Param('id') id: string, @Req() req) {
    return this.pomodoroService.sharePomodoro(id, req.user.id);
  }

  @Get('status')
  getStatus() {
    return { status: 'WebSocket server ready', timestamp: new Date().toISOString() };
  }

  @Post('join/:shareCode')
  @ApiOperation({ summary: 'Join a shared pomodoro' })
  @ApiResponse({ status: 200, description: 'Joined shared pomodoro successfully' })
  @ApiResponse({ status: 404, description: 'Shared pomodoro not found' })
  async joinSharedPomodoro(@Param('shareCode') shareCode: string, @Req() req) {
    return this.pomodoroService.joinSharedPomodoro(shareCode, req.user.id);
  }

  @Get('shared')
  @ApiOperation({ summary: 'Get all shared pomodoros' })
  @ApiResponse({ status: 200, description: 'List of shared pomodoros' })
  async getSharedPomodoros(@Req() req) {
    return this.pomodoroService.getSharedPomodoros(req.user.id);
  }
}
