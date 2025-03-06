import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward } from './entities/reward.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
  ) {}

  // Crea una nueva Reward
  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    try {
      const reward =  await this.rewardModel.create(createRewardDto);
      return reward;
    } catch (error) {
      throw new InternalServerErrorException('Error creating reward');
    }
  }

  // Retorna todas las Rewards
  async findAll(): Promise<Reward[]> {
    return await this.rewardModel.find();
  }

  // Retorna una Reward por su ID
  async findOne(id: string): Promise<Reward> {
    const reward = await this.rewardModel.findById(id);
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }
    return reward;
  }

  // Actualiza una Reward por su ID
  async update(id: string, updateRewardDto: UpdateRewardDto): Promise<Reward> {
    const reward = await this.rewardModel.findByIdAndUpdate(id, updateRewardDto, { new: true });
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }
    return reward;
  }

  // Elimina una Reward por su ID
  async remove(id: string): Promise<Reward> {
    const reward = await this.rewardModel.findByIdAndDelete(id);
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }
    return reward;
  }

  /**
   * Reclama la reward para un usuario.
   * Esta función simula el proceso de reclamar una recompensa, por ejemplo:
   * - Sumar XP al usuario.
   * - Desbloquear elementos asociados (banner, frame, avatar, etc.).
   * 
   * En una implementación real, esta lógica debería delegarse a un UserService o GamificationService.
   * 
   * @param rewardId Identificador de la reward a reclamar.
   * @param userId Identificador del usuario que reclama la reward.
   * @returns Un objeto con un mensaje y los detalles de la reward.
   */
  async claimReward(rewardId: string, userId: string): Promise<{ message: string; reward: Reward }> {
    // Buscamos la reward en la base de datos
    const reward = await this.findOne(rewardId);
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    // Aquí iría la lógica para actualizar el perfil del usuario:
    // Por ejemplo:
    // await this.userService.addXp(userId, reward.xp);
    // await this.userService.unlockItems(userId, {
    //   banner: reward.banner,
    //   frame: reward.frame,
    //   avatar: reward.avatar,
    // });
    // También podrías registrar el evento de "recompensa reclamada" en un historial o emitir una notificación vía WebSocket.

    // Simulamos el proceso devolviendo un mensaje de éxito.
    return {
      message: `Reward claimed successfully! ${reward.xp} XP added to user ${userId}.`,
      reward,
    };
  }
}
