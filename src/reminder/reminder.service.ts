import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateReminderDto } from "./dto/create-reminder.dto";
import { UpdateReminderDto } from "./dto/update-reminder.dto";
import { Reminder, ReminderDocument } from "./entities/reminder.entity";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, isValidObjectId } from "mongoose";

@Injectable()
export class ReminderService {
  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
  ) {}

  async create(
    createReminderDto: CreateReminderDto,
    userId: mongoose.Types.ObjectId,
  ): Promise<Reminder> {
    try {
      const reminder = new this.reminderModel({
        ...createReminderDto,
        user: userId,
      });

      return await reminder.save();
    } catch (error) {
      throw new InternalServerErrorException("Error creating reminder");
    }
  }

  async findAll(userId: mongoose.Types.ObjectId): Promise<Reminder[]> {
    return this.reminderModel.find({ user: userId }).exec();
  }

  async findOne(id: string, userId: mongoose.Types.ObjectId): Promise<Reminder> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid reminder ID");
    }

    const reminder = await this.reminderModel.findById(id).exec();

    if (!reminder) {
      throw new NotFoundException("Reminder not found");
    }

    if (!reminder.user.equals(userId)) {
      throw new ForbiddenException(
        "You do not have permission to access this reminder",
      );
    }

    return reminder;
  }

  async update(
    id: string,
    userId: mongoose.Types.ObjectId,
    updateReminderDto: UpdateReminderDto,
  ): Promise<Reminder> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid reminder ID");
    }

    const reminder = await this.reminderModel.findById(id).exec();

    if (!reminder) {
      throw new NotFoundException("Reminder not found");
    }

    if (!reminder.user.equals(userId)) {
      throw new ForbiddenException(
        "You do not have permission to update this reminder",
      );
    }

    try {
      return await this.reminderModel
        .findByIdAndUpdate(id, updateReminderDto, { new: true })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException("Error updating reminder");
    }
  }

  async remove(id: string, userId: mongoose.Types.ObjectId): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid reminder ID");
    }

    const reminder = await this.reminderModel.findById(id).exec();

    if (!reminder) {
      throw new NotFoundException("Reminder not found");
    }

    if (!reminder.user.equals(userId)) {
      throw new ForbiddenException(
        "You do not have permission to delete this reminder",
      );
    }

    try {
      await this.reminderModel.deleteOne({ _id: id }).exec();
    } catch (error) {
      throw new InternalServerErrorException("Error deleting reminder");
    }
  }
}
