// src/pomodoro/pomodoro.gateway.ts
import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PomodoroService } from './pomodoro.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';

interface StartPomodoroPayload {
  userId: string;
  duration?: number;  // Optional duration in seconds
  breakDuration?: number;  // Optional break duration in seconds
}

interface StopPomodoroPayload {
  pomodoroId: string;
}

interface PausePomodoroPayload {
  pomodoroId: string;
}

interface GetStatusPayload {
  userId: string;
}

interface ResumePomodoroPayload {
  userId: string;
}

interface PomodoroStatus {
  userId: string;
  pomodoroId: string;
  active: boolean;
  remainingTime: number;
  isBreak?: boolean;
  isPaused?: boolean;
}

@UseGuards(WsJwtAuthGuard)
@WebSocketGateway({ 
  namespace: 'pomodoro', 
  cors: { 
    origin: ['http://localhost:3000', 'http://localhost:4000'],
    credentials: true 
  } 
})
@Injectable()
export class PomodoroGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(PomodoroGateway.name);
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  @WebSocketServer() server: Server;

  constructor(private pomodoroService: PomodoroService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up any active timers for this client
    this.cleanupTimers(client.id);
  }

  private cleanupTimers(clientId: string) {
    const timer = this.activeTimers.get(clientId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(clientId);
    }
  }

  @SubscribeMessage('startPomodoro')
  async startPomodoro(client: Socket, payload: StartPomodoroPayload) {
    try {
      const { userId, duration = 1500, breakDuration = 300 } = payload;
      if (!userId) {
        throw new Error('userId is required');
      }

      const pomodoro = await this.pomodoroService.startPomodoro(userId, duration);
      
      // Clean up any existing timer for this user
      this.cleanupTimers(userId);
      
      // Start the pomodoro cycle with custom durations
      this.startPomodoroCycle(userId, pomodoro.id, duration, breakDuration);
      
      return { success: true, pomodoroId: pomodoro.id };
    } catch (error) {
      this.logger.error(`Error starting pomodoro: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('stopPomodoro')
  async stopPomodoro(client: Socket, payload: StopPomodoroPayload) {
    try {
      const { pomodoroId } = payload;
      if (!pomodoroId) {
        throw new Error('pomodoroId is required');
      }

      const pomodoro = await this.pomodoroService.stopPomodoro(pomodoroId);
      
      // Clean up the timer
      this.cleanupTimers(pomodoro.userId.toString());

      const status: PomodoroStatus = {
        userId: pomodoro.userId.toString(),
        pomodoroId: pomodoro.id,
        active: false,
        remainingTime: 0
      };
      
      this.server.emit('pomodoroStatus', status);
      return { success: true, status };
    } catch (error) {
      this.logger.error(`Error stopping pomodoro: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getPomodoroStatus')
  async getPomodoroStatus(client: Socket, payload: GetStatusPayload) {
    try {
      const { userId } = payload;
      if (!userId) {
        throw new Error('userId is required');
      }

      const pomodoro = await this.pomodoroService.getActivePomodoro(userId);
      if (pomodoro) {
        const status: PomodoroStatus = {
          userId: pomodoro.userId.toString(),
          pomodoroId: pomodoro.id,
          active: pomodoro.active,
          remainingTime: pomodoro.remainingTime,
          isBreak: pomodoro.type !== 'pomodoro',
          isPaused: false
        };
        client.emit('pomodoroStatus', status);
        return { success: true, status };
      }
      return { success: true, status: null };
    } catch (error) {
      this.logger.error(`Error getting pomodoro status: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('pausePomodoro')
  async pausePomodoro(client: Socket, payload: PausePomodoroPayload) {
    try {
      const { pomodoroId } = payload;
      if (!pomodoroId) {
        throw new Error('pomodoroId is required');
      }

      const pomodoro = await this.pomodoroService.getPomodoroById(pomodoroId);
      if (!pomodoro) {
        throw new Error('Pomodoro not found');
      }

      // Get the current timer for this user
      const timer = this.activeTimers.get(pomodoro.userId.toString());
      if (!timer) {
        throw new Error('No active timer found');
      }

      // Get the current remaining time from the timer
      const currentRemainingTime = (timer as any)._idleStart ? 
        Math.ceil((timer as any)._idleStart / 1000) : 
        pomodoro.remainingTime;

      // Update the remaining time in the database
      await this.pomodoroService.updateRemainingTime(pomodoroId, currentRemainingTime);

      // Clean up the timer
      this.cleanupTimers(pomodoro.userId.toString());

      const status: PomodoroStatus = {
        userId: pomodoro.userId.toString(),
        pomodoroId: pomodoro.id,
        active: true,
        remainingTime: currentRemainingTime,
        isPaused: true
      };
      
      this.server.emit('pomodoroStatus', status);
      return { success: true, status };
    } catch (error) {
      this.logger.error(`Error pausing pomodoro: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getActivePomodoro')
  async getActivePomodoro(client: Socket, payload: GetStatusPayload) {
    try {
      const { userId } = payload;
      if (!userId) {
        throw new Error('userId is required');
      }

      const activePomodoro = await this.pomodoroService.getActivePomodoro(userId);
      if (!activePomodoro) {
        return { success: true, pomodoro: null };
      }

      return {
        success: true,
        pomodoro: {
          id: activePomodoro.id,
          userId: activePomodoro.userId.toString(),
          remainingTime: activePomodoro.remainingTime,
          type: activePomodoro.type,
          active: activePomodoro.active
        }
      };
    } catch (error) {
      this.logger.error(`Error getting active pomodoro: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('resumePomodoro')
  async resumePomodoro(client: Socket, payload: ResumePomodoroPayload) {
    try {
      const { userId } = payload;
      if (!userId) {
        throw new Error('userId is required');
      }

      const activePomodoro = await this.pomodoroService.getActivePomodoro(userId);
      if (!activePomodoro) {
        throw new Error('No active pomodoro found');
      }

      // Start the pomodoro cycle with the remaining time
      this.startPomodoroCycle(
        userId,
        activePomodoro.id,
        activePomodoro.remainingTime,
        activePomodoro.type === 'pomodoro' ? 300 : 1500 // Default break durations
      );

      const status: PomodoroStatus = {
        userId: activePomodoro.userId.toString(),
        pomodoroId: activePomodoro.id,
        active: true,
        remainingTime: activePomodoro.remainingTime,
        isPaused: false,
        isBreak: activePomodoro.type !== 'pomodoro'
      };
      
      this.server.emit('pomodoroStatus', status);
      return { success: true, status };
    } catch (error) {
      this.logger.error(`Error resuming pomodoro: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  private async startPomodoroCycle(userId: string, pomodoroId: string, duration: number, breakDuration: number) {
    let remainingTime = duration;
    
    const interval = setInterval(async () => {
      try {
        if (remainingTime <= 0) {
          clearInterval(interval);
          this.activeTimers.delete(userId);

          // Stop the pomodoro in the database
          await this.pomodoroService.stopPomodoro(pomodoroId);

          // Emit completion status
          this.server.emit('pomodoroStatus', {
            userId,
            pomodoroId,
            active: false,
            remainingTime: 0,
            isBreak: false,
            isPaused: false
          });

          // Start break with custom duration
          this.startBreak(userId, breakDuration);
        } else {
          remainingTime--;
          this.server.emit('pomodoroStatus', {
            userId,
            pomodoroId,
            active: true,
            remainingTime,
            isBreak: false,
            isPaused: false
          });
        }
      } catch (error) {
        this.logger.error(`Error in pomodoro cycle: ${error.message}`);
        clearInterval(interval);
        this.activeTimers.delete(userId);
        this.server.emit('error', { userId, message: error.message });
      }
    }, 1000);

    this.activeTimers.set(userId, interval);
  }

  private async startBreak(userId: string, breakDuration: number = 300) {
    let breakTime = breakDuration;
    
    const breakInterval = setInterval(async () => {
      try {
        if (breakTime <= 0) {
          clearInterval(breakInterval);
          this.activeTimers.delete(userId);

          this.server.emit('pomodoroStatus', {
            userId,
            pomodoroId: null,
            active: false,
            remainingTime: 0,
            isBreak: false,
            isPaused: false
          });
        } else {
          breakTime--;
          this.server.emit('pomodoroStatus', {
            userId,
            pomodoroId: null,
            active: true,
            remainingTime: breakTime,
            isBreak: true,
            isPaused: false
          });
        }
      } catch (error) {
        this.logger.error(`Error in break cycle: ${error.message}`);
        clearInterval(breakInterval);
        this.activeTimers.delete(userId);
        this.server.emit('error', { userId, message: error.message });
      }
    }, 1000);

    this.activeTimers.set(userId, breakInterval);
  }
}
