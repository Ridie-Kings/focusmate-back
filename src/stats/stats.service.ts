import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stat } from './stat.entity';
import { StatDocument } from './entities/stats.entity';

@Injectable()
export class StatsService {
  constructor(@InjectModel(Stat.name) private statsModel: Model<StatDocument>) {}

  // Verifica si el documento de estadísticas existe, si no lo crea
  async initializeStats(): Promise<Stats> {
    let stats = await this.statsModel.findOne();  // Busca el único documento de Stats

    if (!stats) {
      // Si no existe, crea un documento por defecto
      stats = new this.statsModel({
        completedTasks: 0,
        pendingTasks: 0,
        totalDuration: 0,
        totalUsers: 0,
      });

      await stats.save();  // Guarda el documento en la base de datos
    }

    return stats;
  }

  // Obtiene las estadísticas globales
  async getStats(): Promise<Stats> {
    let stats = await this.statsModel.findOne();  // Obtiene el único documento de Stats

    if (!stats) {
      stats = await this.initializeStats();  // Inicializa si no existe
    }

    return stats;
  }

  // Actualiza las estadísticas
  async updateStats(updateData: Partial<Stats>): Promise<Stats> {
    const stats = await this.statsModel.findOne();  // Busca el documento de Stats

    if (!stats) {
      return this.initializeStats();  // Si no existe, lo inicializa
    }

    // Actualiza las estadísticas con los datos proporcionados
    Object.assign(stats, updateData);
    stats.lastUpdated = new Date();  // Actualiza la fecha de actualización

    await stats.save();  // Guarda los cambios

    return stats;
  }
}
