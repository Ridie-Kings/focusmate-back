// src/pomodoro/pomodoro.gateway.ts
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PomodoroService } from './pomodoro.service';
import { Pomodoro } from './entities/pomodoro.entity';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import mongoose from 'mongoose';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@UseGuards(WsJwtAuthGuard)
@WebSocketGateway({ 
  path: '/api/v0/pomodoro/ws',
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
export class PomodoroGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PomodoroGateway.name);

  constructor(
    @Inject(forwardRef(() => PomodoroService)) private readonly pomodoroService: PomodoroService
  ) {}

  afterInit(server: Server) {
    this.logger.log('Initialized');
    // server.of('/').on('connection', socket => {
    //   this.logger.log(`💡 Test-namespace "/" conectado (socket-id: ${socket.id})`);
    //   // no hace nada más, solo permite que el Test Client conecte
    // });
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected');
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected');
  }

  @SubscribeMessage('join')
  async handleJoin(@MessageBody() data: {id: string}, @ConnectedSocket() client: Socket, @GetUser() user: User) {
    const {id} = data;
    const pomodoro = await this.pomodoroService.findOne(new mongoose.Types.ObjectId(id), user.id);
    if(!pomodoro) {
      client.emit('error', 'Pomodoro not found');
      return;
    }
    client.join(id);
    this.emitStatus(pomodoro);
    this.logger.log(`💡 User ${user.id} joined room ${id}`);
  }

  emitStatus(pomodoro: Pomodoro) {
    this.server.to(pomodoro.id.toString()).emit('status', {
      state: pomodoro.state,
      currentCycle: pomodoro.currentCycle,
      endsAt: pomodoro.endTime,
    });
  }
}

