import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateReminderDto } from "./dto/create-reminder.dto";
import { UpdateReminderDto } from "./dto/update-reminder.dto";
import { Reminder, ReminderDocument } from "./entities/reminder.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ReminderService {
  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
  ) {}

  async create(
    createReminderDto: CreateReminderDto,
    userId: string,
  ): Promise<Reminder> {
    const reminder = new this.reminderModel({
      ...createReminderDto,
      user: userId,
    });

    return reminder.save();
  }

  async findAll(userId: string): Promise<Reminder[]> {
    return this.reminderModel.find({ user: userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<Reminder> {
    const reminder = await this.reminderModel
      .findOne({ _id: id, user: userId })
      .exec();
    if (!reminder) {
      throw new Error("Reminder not found");
    }
    return reminder;
  }

  async update(
    id: string,
    userId: string,
    updateReminderDto: UpdateReminderDto,
  ): Promise<Reminder> {
    const updatedReminder = await this.reminderModel
      .findOneAndUpdate({ _id: id, user: userId }, updateReminderDto, {
        new: true,
      })
      .exec();

    if (!updatedReminder) {
      throw new NotFoundException("Reminder not found");
    }

    return updatedReminder;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.reminderModel
      .deleteOne({ _id: id, user: userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException("Reminder not found");
    }
  }
}
