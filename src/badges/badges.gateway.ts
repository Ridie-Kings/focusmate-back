import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { BadgesService } from './badges.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import { Badge } from './entities/badge.entity';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt-auth.guard';

// Opcionalmente, puedes especificar un namespace o configuraciones
@WebSocketGateway({ namespace: 'badges' })
export class BadgesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly badgesService: BadgesService) {}

  /**
   * Crea un nuevo badge
   * @param createBadgeDto Datos del badge a crear
   * @returns El badge creado
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('createBadge')
  async createBadge(
    @MessageBody() createBadgeDto: CreateBadgeDto,
  ): Promise<Badge> {
    // Aquí podrías aplicar validaciones manuales si lo requieres
    // O usar class-validator con un pipe global para WS
    const badge = await this.badgesService.create(createBadgeDto);
    // Si quieres notificar a todos los clientes conectados que hay un nuevo badge:
    this.server.emit('badgeCreated', badge);
    return badge;
  }

  /**
   * Retorna todos los badges
   * @returns Lista de badges
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('findAllBadges')
  async findAllBadges(): Promise<Badge[]> {
    return this.badgesService.findAll();
  }

  /**
   * Retorna un badge por su ID
   * @param id Identificador del badge en MongoDB
   * @returns El badge encontrado
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('findOneBadge')
  async findOneBadge(
    @MessageBody() id: string,
  ): Promise<Badge> {
    const objectId = new mongoose.Types.ObjectId(id);
    return this.badgesService.findOne(objectId);
  }

  /**
   * Actualiza un badge
   * @param payload Debe contener { id, updateBadgeDto }
   * @returns El badge actualizado
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('updateBadge')
  async updateBadge(
    @MessageBody()
    payload: { id: string; updateBadgeDto: UpdateBadgeDto },
  ): Promise<Badge> {
    const objectId = new mongoose.Types.ObjectId(payload.id);
    const badge = await this.badgesService.update(objectId, payload.updateBadgeDto);
    // Podrías emitir un evento de "badgeUpdated" a todos los clientes o solo a uno
    this.server.emit('badgeUpdated', badge);
    return badge;
  }

  /**
   * Elimina un badge por su ID
   * @param id Identificador del badge
   * @returns El badge eliminado
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('removeBadge')
  async removeBadge(
    @MessageBody() id: string,
  ): Promise<Badge> {
    const objectId = new mongoose.Types.ObjectId(id);
    const badge = await this.badgesService.remove(objectId);
    // Notificas la eliminación, si corresponde
    this.server.emit('badgeRemoved', badge);
    return badge;
  }

  /**
   * Ejemplo de hook al conectar un cliente
   */
  @UseGuards(WsJwtAuthGuard)
  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  /**
   * Ejemplo de hook al desconectar un cliente
   */
  @UseGuards(WsJwtAuthGuard)
  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
