import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ReminderService } from "./reminder.service";
import { CreateReminderDto, UpdateReminderDto } from "./dto/index";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser } from "src/users/decorators/get-user.decorator";
import { User } from "src/users/entities/user.entity";
import { ParseMongoIdPipe } from "src/common/pipes/parse-mongo-id.pipe";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("Reminders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("reminders")
export class ReminderController {
  constructor(private readonly remindersService: ReminderService) {}

  @Post()
  @ApiOperation({ summary: "Create a new reminder" })
  @ApiResponse({ status: 201, description: "Reminder successfully created" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  create(@Body() createReminderDto: CreateReminderDto, @GetUser() user: User) {
    return this.remindersService.create(createReminderDto, user._id.toString());
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all reminders of the authenticated user" })
  @ApiResponse({ status: 200, description: "List of reminders retrieved" })
  findAll(@GetUser() user: User) {
    return this.remindersService.findAll(user._id.toString());
  }

  @Get(":id")
  @ApiOperation({ summary: "Retrieve a specific reminder by ID" })
  @ApiResponse({ status: 200, description: "Reminder retrieved successfully" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Reminder not found" })
  findOne(@Param("id", ParseMongoIdPipe) id: string, @GetUser() user: User) {
    return this.remindersService.findOne(id, user._id.toString());
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a reminder by ID" })
  @ApiResponse({ status: 200, description: "Reminder updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Reminder not found" })
  update(
    @Param("id", ParseMongoIdPipe) id: string,
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
  @ApiOperation({ summary: "Delete a reminder by ID" })
  @ApiResponse({ status: 200, description: "Reminder deleted successfully" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  @ApiResponse({ status: 404, description: "Reminder not found" })
  remove(@Param("id", ParseMongoIdPipe) id: string, @GetUser() user: User) {
    return this.remindersService.remove(id, user._id.toString());
  }
}
