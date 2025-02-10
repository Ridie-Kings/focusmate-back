import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from "@nestjs/common";
import { ReminderService } from "./reminder.service";
import { CreateReminderDto, UpdateReminderDto } from "./dto/index";
import { AuthGuard } from "@nestjs/passport";
import { UseGuards } from "@nestjs/common";
import { GetUser } from "src/users/decorators/get-user.decorator";
import { User } from "src/users/entities/user.entity";

@UseGuards(AuthGuard())
@Controller("reminders")
export class ReminderController {
  constructor(private readonly remindersService: ReminderService) {}

  @Post()
  create(@Body() createReminderDto: CreateReminderDto, @GetUser() user: User) {
    return this.remindersService.create(createReminderDto, user._id.toString());
  }
  @Get()
  findAll(@GetUser() user: User) {
    return this.remindersService.findAll(user.id as string);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @GetUser() user: User) {
    return this.remindersService.findOne(id, user.id as string);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateReminderDto: UpdateReminderDto,
    @GetUser() user: User,
  ) {
    return this.remindersService.update(
      id,
      user._id.toString(),
      updateReminderDto,
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string, @GetUser() user: User) {
    return this.remindersService.remove(id, user._id.toString());
  }
}
