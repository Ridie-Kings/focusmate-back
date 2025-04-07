// src/pomodoro/pomodoro.gateway.ts
import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PomodoroService } from './pomodoro.service';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class PomodoroGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private pomodoroService: PomodoroService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('startPomodoro')
  async startPomodoro(client: Socket, payload: { userId: string }) {
    const { userId } = payload;

    // Obtener la duración personalizada del usuario desde su configuración
    const duration = 1500; // Default to 25 minutes if no preference

    const pomodoro = await this.pomodoroService.startPomodoro(userId, duration);
    this.startTimer(userId, pomodoro.id, duration);
  }

  @SubscribeMessage('stopPomodoro')
  async stopPomodoro(client: Socket, payload: { pomodoroId: string }) {
    const pomodoro = await this.pomodoroService.stopPomodoro(payload.pomodoroId);

    // Emitir el estado actualizado del Pomodoro detenido
    this.server.emit('pomodoroStatus', { userId: pomodoro.userId, active: false, remainingTime: 0 });
  }

  @SubscribeMessage('getPomodoroStatus')
  async getPomodoroStatus(client: Socket, payload: { userId: string }) {
    const pomodoro = await this.pomodoroService.getPomodoroStatus(payload.userId);
    client.emit('pomodoroStatus', pomodoro);
  }

  private async startTimer(userId: string, pomodoroId: string, duration: number) {
    let remainingTime = duration;
    
    // Actualizar el temporizador y emitir actualizaciones cada segundo
    const interval = setInterval(async () => {
      if (remainingTime <= 0) {
        clearInterval(interval);
        this.server.emit('pomodoroStatus', { userId, active: false, remainingTime: 0 });

        // Detener el Pomodoro en la base de datos
        await this.pomodoroService.stopPomodoro(pomodoroId);
      } else {
        remainingTime--;
        this.server.emit('pomodoroStatus', { userId, active: true, remainingTime });
      }
    }, 1000);
  }
  private async startPomodoroCycle(userId: string, duration: number) {
    let remainingTime = duration;
    
    // Iniciar el Pomodoro
    const interval = setInterval(async () => {
      if (remainingTime <= 0) {
        clearInterval(interval);
  
        // Emitir estado del Pomodoro terminado
        this.server.emit('pomodoroStatus', { userId, active: false, remainingTime: 0 });
  
        // Guardar el estado del Pomodoro en la base de datos
        await this.pomodoroService.stopPomodoro(userId);
  
        // Iniciar el descanso (5 minutos)
        this.startBreak(userId, 300);  // 5 minutos
      } else {
        remainingTime--;
        this.server.emit('pomodoroStatus', { userId, active: true, remainingTime });
      }
    }, 1000);
  }
  
  private async startBreak(userId: string, breakDuration: number) {
    let breakTime = breakDuration;
    
    // Iniciar descanso
    const breakInterval = setInterval(async () => {
      if (breakTime <= 0) {
        clearInterval(breakInterval);
  
        // Emitir estado de descanso terminado
        this.server.emit('pomodoroStatus', { userId, active: false, remainingTime: 0 });
  
        // Permitir al usuario empezar un nuevo Pomodoro
      } else {
        breakTime--;
        this.server.emit('pomodoroStatus', { userId, active: false, remainingTime: breakTime });
      }
    }, 1000);
  }
  
}
