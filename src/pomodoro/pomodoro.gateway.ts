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
import { User, UserDocument } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

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
    @Inject(forwardRef(() => PomodoroService)) private readonly pomodoroService: PomodoroService,
    private readonly jwtService: JwtService
  ) {}

  afterInit(server: Server) {
    this.logger.log('Initialized');
    // server.of('/').on('connection', socket => {
    //   this.logger.log(`💡 Test-namespace "/" conectado (socket-id: ${socket.id})`);
    //   // no hace nada más, solo permite que el Test Client conecte
    // });
  }

  async handleConnection(client: Socket, @GetUser() user: UserDocument) {
    this.logger.log('Client connected');
    const raw = client.handshake.auth.token || client.handshake.headers.authorization;
    const token = raw?.replace(/^Bearer\s+/,'');
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      (client as any).user = payload;
      this.logger.log(`✔️ Client ${client.id} connected as user ${payload.id}`);
      const pomodoro = await this.pomodoroService.findWorking(payload.id);
      if(pomodoro) {
        this.server.to(client.id).emit('pomodoro found', pomodoro);
      }
    } catch (error) {
      this.logger.error(error);
      client.disconnect(true);
    }
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

  @SubscribeMessage('leave')
  async handleLeave(@MessageBody() data: {id: string}, @ConnectedSocket() client: Socket, @GetUser() user: User) {
    const {id} = data;
    client.leave(id);
    this.logger.log(`💡 User ${user.id} left room ${id}`);
  }

  emitStatus(pomodoro: Pomodoro) {
    this.server.to(pomodoro.id.toString()).emit('status', {
      state: pomodoro.state,
      currentCycle: pomodoro.currentCycle,
      endsAt: pomodoro.endTime,
      remainingTime: pomodoro.remainingTime,
      pausedState: pomodoro.pausedState,
    });
  }
}

