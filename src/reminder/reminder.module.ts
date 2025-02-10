import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ReminderService } from "./reminder.service";
import { ReminderController } from "./reminder.controller";
import { Reminder, ReminderSchema } from "./entities/reminder.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reminder.name, schema: ReminderSchema },
    ]),
    AuthModule,
  ],
  controllers: [ReminderController],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class ReminderModule {}
