import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CalendarService } from "./calendar.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { GetUser } from "../users/decorators/get-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Calendar")
@Controller("calendar")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get("tasks")
  @ApiOperation({ summary: "Get tasks by filters" })
  @ApiQuery({
    name: "startDate",
    required: false,
    example: "2025-02-24T00:00:00Z",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    example: "2025-02-28T23:59:59Z",
  })
  @ApiQuery({ name: "status", required: false, example: "completed | pending" })
  async getTasks(
    @GetUser() user: User,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("status") status?: string,
  ) {
    return this.calendarService.getTasks(user.id, startDate, endDate, status);
  }

  @Get("events")
  @ApiOperation({ summary: "Get events by filters" })
  @ApiQuery({
    name: "startDate",
    required: false,
    example: "2025-02-24T00:00:00Z",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    example: "2025-02-28T23:59:59Z",
  })
  @ApiQuery({
    name: "category",
    required: false,
    example: "meeting | study | personal",
  })
  async getEvents(
    @GetUser() user: User,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("category") category?: string,
  ) {
    return this.calendarService.getEvents(
      user.id,
      startDate,
      endDate,
      category,
    );
  }

  @Get("reminders")
  @ApiOperation({ summary: "Get reminders by filters" })
  @ApiQuery({
    name: "startDate",
    required: false,
    example: "2025-02-24T00:00:00Z",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    example: "2025-02-28T23:59:59Z",
  })
  @ApiQuery({
    name: "priority",
    required: false,
    example: "high | medium | low",
  })
  async getReminders(
    @GetUser() user: User,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("priority") priority?: string,
  ) {
    return this.calendarService.getReminders(
      user.id,
      startDate,
      endDate,
      priority,
    );
  }
}