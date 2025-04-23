// src/pomodoro/pomodoro.gateway.ts
import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PomodoroService } from './pomodoro.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import mongoose from 'mongoose';

interface StartPomodoroPayload {
  userId: string;
  duration?: number;  // Optional duration in seconds
  breakDuration?: number;  // Optional break duration in seconds
}

interface StopPomodoroPayload {
  pomodoroId: string;
}

interface PausePomodoroPayload {
  userId: string;
}

interface GetStatusPayload {
  userId: string;
}

interface ResumePomodoroPayload {
  userId: string;
}

interface JoinSharedPomodoroPayload {
  shareCode: string;
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
  path: '/api/v0/pomodoro',
  cors: { 
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "https://sherp-app.com",
      "http://sherp-app.com"
    ],
    credentials: true,
    allowedHeaders: ['content-type', 'authorization']
  },
  transports: ['websocket']  // Only use websocket transport
})
@Injectable()
export class PomodoroGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(PomodoroGateway.name);
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private userRemainingTimes: Map<string, number> = new Map();

  @WebSocketServer() server: Server;

  constructor(private pomodoroService: PomodoroService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId);
    }
    client.emit('connected', { message: 'Connected to Pomodoro WebSocket' });
    this.logger.debug(`Client handshake: ${JSON.stringify(client.handshake)}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Get the user ID from the socket handshake
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.pauseActivePomodoroOnDisconnect(userId);
    }
    
    // Clean up any active timers for this client
    this.cleanupTimers(client.id);
  }

  private async pauseActivePomodoroOnDisconnect(userId: string) {
    try {
      const activePomodoro = await this.pomodoroService.getActivePomodoro(userId);
      if (activePomodoro && activePomodoro.active && !activePomodoro.isPaused) {
        this.logger.log(`Auto-pausing pomodoro for user ${userId} on disconnect`);
        
        // Usar el tiempo restante que hemos estado rastreando
        const currentRemainingTime = this.userRemainingTimes.get(userId) || activePomodoro.remainingTime;
  
        // Actualizar la base de datos y marcar como pausado
        await this.pomodoroService.updateRemainingTime(activePomodoro.id, currentRemainingTime);
        await this.pomodoroService.updatePomodoroStatus(activePomodoro.id, { isPaused: true });
  
        // Limpiar el temporizador
        this.cleanupTimers(userId);
  
        // Emitir actualización de estado
        const status: PomodoroStatus = {
          userId: activePomodoro.userId.toString(),
          pomodoroId: activePomodoro.id,
          active: true,
          remainingTime: currentRemainingTime,
          isPaused: true
        };
        
        this.server.to(userId).emit('pomodoroStatus', status);
      }
    } catch (error) {
      this.logger.error(`Error auto-pausing pomodoro on disconnect: ${error.message}`);
    }
  }

  private async checkAndResumePausedPomodoro(client: Socket) {
    try {
      // Get the user ID from the socket handshake
      const userId = client.handshake.query.userId as string;
      if (!userId) {
        this.logger.warn('No userId found in handshake query');
        return;
      }

      // Get active pomodoro for the user
      const activePomodoro = await this.pomodoroService.getActivePomodoro(userId);
      if (activePomodoro && activePomodoro.isPaused) {
        this.logger.log(`Resuming paused pomodoro for user ${userId}`);
        // Resume the pomodoro
        await this.resumePomodoro(client, { userId });
      }
    } catch (error) {
      this.logger.error(`Error checking paused pomodoro: ${error.message}`);
    }
  }

  private async cleanupTimers(clientId: string) {
    const timer = this.activeTimers.get(clientId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(clientId);
      this.userRemainingTimes.delete(clientId);
    }
  }

  @SubscribeMessage('startPomodoro')
  async startPomodoro(client: Socket, payload: StartPomodoroPayload) {
    this.logger.debug(`Received startPomodoro event with payload: ${JSON.stringify(payload)}`);
    try {
      const { userId, duration = 1500, breakDuration = 300 } = payload;
      if (!userId) {
        this.logger.error('userId is required');
        client.emit('error', { message: 'userId is required' });
        return { success: false, error: 'userId is required' };
      }

      this.logger.debug(`Starting pomodoro for user ${userId}`);
      const pomodoro = await this.pomodoroService.startPomodoro(userId, duration);
      
      // Clean up any existing timer for this user
      this.cleanupTimers(userId);
      
      // Start the pomodoro cycle with custom durations
      this.startPomodoroCycle(userId, pomodoro.id, duration, breakDuration);
      
      const response = { success: true, pomodoro: {
        userId,
        pomodoroId: pomodoro.id,
        active: pomodoro.active,
        remainingTime: pomodoro.duration,
        isBreak: false,
        isPaused: false,
      } };
      this.logger.debug(`Pomodoro started successfully: ${JSON.stringify(response)}`);
      client.emit('pomodoroStarted', response);
      return response;
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
      
      this.server.to(pomodoro.userId.toString()).emit('pomodoroStopped', {success: true});
      return { success: true, status };
    } catch (error) {
      this.logger.error(`Error stopping pomodoro: ${error.message}`);
      console.log(error.stack);
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

    this.logger.log(`Attempting to get pomodoro status for user ${userId}`);
    
    try {
      const pomodoro = await this.pomodoroService.getActivePomodoro(userId);
      this.logger.log(`Retrieved pomodoro status: ${JSON.stringify(pomodoro)}`);
      
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
      
      this.logger.log('No active pomodoro found');
      return { success: true, status: null };
    } catch (dbError) {
      this.logger.error(`Database error: ${dbError.message}`, dbError.stack);
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    this.logger.error(`Error in getPomodoroStatus: ${error.message}`, error.stack);
    client.emit('error', { message: error.message });
    return { success: false, error: error.message };
  }
}

  @SubscribeMessage('pausePomodoro')
  async pausePomodoro(client: Socket, payload: PausePomodoroPayload) {
    try {
      const { userId } = payload;
      if (!userId) {
        throw new Error('userId is required');
      }

      const activePomodoro = await this.pomodoroService.getActivePomodoro(userId);
      if (!activePomodoro) {
        throw new Error('No active pomodoro found');
      }
      

      const currentRemainingTime = this.userRemainingTimes.get(userId) || activePomodoro.remainingTime;

      // Update the remaining time in the database and mark as paused
      await this.pomodoroService.updateRemainingTime(activePomodoro.id, currentRemainingTime);
      await this.pomodoroService.updatePomodoroStatus(activePomodoro.id, { isPaused: true });

      // Clean up the timer
      this.cleanupTimers(userId);

      const status: PomodoroStatus = {
        userId: activePomodoro.userId.toString(),
        pomodoroId: activePomodoro.id,
        active: true,
        remainingTime: currentRemainingTime,
        isPaused: true
      };
      
      this.server.to(userId).emit('pomodoroStatus', status);
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

      // Update pomodoro status to not paused
      await this.pomodoroService.updatePomodoroStatus(activePomodoro.id, { isPaused: false });

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
      
      this.server.to(userId).emit('pomodoroStatus', status);
      return { success: true, status };
    } catch (error) {
      this.logger.error(`Error resuming pomodoro: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('joinSharedPomodoro')
  async joinSharedPomodoro(client: Socket, payload: JoinSharedPomodoroPayload) {
    try {
      const { shareCode, userId } = payload;
      if (!shareCode || !userId) {
        throw new Error('shareCode and userId are required');
      }

      const pomodoro = await this.pomodoroService.joinSharedPomodoro(shareCode, new mongoose.Types.ObjectId(userId));
      
      // Join the room for this shared pomodoro
      client.join(`pomodoro:${pomodoro.id}`);
      
      // Send the current status to the joining user
      const status: PomodoroStatus = {
        userId: pomodoro.userId.toString(),
        pomodoroId: pomodoro.id,
        active: pomodoro.active,
        remainingTime: pomodoro.remainingTime,
        isPaused: pomodoro.isPaused,
        isBreak: pomodoro.type !== 'pomodoro'
      };
      
      client.emit('pomodoroStatus', status);
      
      // Notify other users in the room
      client.to(`pomodoro:${pomodoro.id}`).emit('userJoined', {
        userId,
        pomodoroId: pomodoro.id
      });
      
      return { success: true, pomodoro };
    } catch (error) {
      this.logger.error(`Error joining shared pomodoro: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  private async startPomodoroCycle(userId: string, pomodoroId: string, duration: number, breakDuration: number) {
    let remainingTime = duration;
    this.userRemainingTimes.set(userId, remainingTime);
    
    const interval = setInterval(async () => {
      try {
        if (remainingTime <= 0) {
          clearInterval(interval);
          this.activeTimers.delete(userId);

          // Stop the pomodoro in the database
          await this.pomodoroService.stopPomodoro(pomodoroId);

          // Emit completion status to all clients
          this.server.to(userId).emit('pomodoroStatus', {
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
          this.userRemainingTimes.set(userId, remainingTime);
          // Update remaining time in the database periodically (every 15 seconds)
          if (remainingTime % 15 === 0) {
            await this.pomodoroService.updateRemainingTime(pomodoroId, remainingTime);
          }
          
          // Emit status update to all clients
          this.server.to(userId).emit('pomodoroStatus', {
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
        this.server.to(userId).emit('error', { userId, message: error.message });
      }
    }, 1000);

    this.activeTimers.set(userId, interval);
  }

  private async startBreak(userId: string, breakDuration: number = 300) {
    try {
      // Create a new pomodoro record for the break
      const breakPomodoro = await this.pomodoroService.startPomodoro(userId, breakDuration);
      // Set the type to shortBreak
      await this.pomodoroService.updatePomodoroStatus(breakPomodoro.id, { type: 'shortBreak' });
      
      let breakTime = breakDuration;
      
      const breakInterval = setInterval(async () => {
        try {
          if (breakTime <= 0) {
            clearInterval(breakInterval);
            this.activeTimers.delete(userId);

            // Stop the break pomodoro
            await this.pomodoroService.stopPomodoro(breakPomodoro.id);

            this.server.to(userId).emit('pomodoroStatus', {
              userId,
              pomodoroId: breakPomodoro.id,
              active: false,
              remainingTime: 0,
              isBreak: false,
              isPaused: false
            });
          } else {
            breakTime--;
            // Update remaining time in database periodically
            if (breakTime % 15 === 0) {
              await this.pomodoroService.updateRemainingTime(breakPomodoro.id, breakTime);
            }
            
            this.server.to(userId).emit('pomodoroStatus', {
              userId,
              pomodoroId: breakPomodoro.id,
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
          this.server.to(userId).emit('error', { userId, message: error.message });
        }
      }, 1000);

      this.activeTimers.set(userId, breakInterval);
    } catch (error) {
      this.logger.error(`Error starting break: ${error.message}`);
      this.server.to(userId).emit('error', { userId, message: error.message });
    }
  }
}
