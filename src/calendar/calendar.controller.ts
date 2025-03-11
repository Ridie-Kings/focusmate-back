import { Controller, Get, Post, Query, Patch, UseGuards, Param } from "@nestjs/common";
import { CalendarService } from "./calendar.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { GetUser } from "../users/decorators/get-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Calendar")
@Controller("calendar")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({ summary: "Create a new Calendar" })
  @ApiResponse({ status: 201, description: "Calendar successfully created" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  async createCalendar(@GetUser() user: User) {
    return this.calendarService.createCalendar(user.id);
  }

  @Patch(':id/addTask/:taskId')
  @ApiOperation({ summary: 'Add a task to a calendar' })
  @ApiResponse({ status: 200, description: "Calendar successfully updated" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 404, description: "Calendar not found" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  async addTask(@Param('id') id: string, @GetUser() user: User, @Param('taskId') taskId: string) {
    return this.calendarService.addTask(id, user.id, taskId);
  }

  @Patch(':id/addEvent/:eventId')
  @ApiOperation({ summary: 'Add a Event to a calendar' })
  @ApiResponse({ status: 200, description: "Calendar successfully updated" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 404, description: "Calendar not found" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  async addEvent(@Param('id') id: string, @GetUser() user: User, @Param('eventId') eventId: string) {
    return this.calendarService.addEvent(id, user.id, eventId);
  }

  @Patch(':id/addReminder/:reminderId')
  @ApiOperation({ summary: 'Add a Event to a calendar' })
  @ApiResponse({ status: 200, description: "Calendar successfully updated" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 404, description: "Calendar not found" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  async addReminder(@Param('id') id: string, @GetUser() user: User, @Param('reminderId') reminderId: string) {
    return this.calendarService.addReminder(id, user.id, reminderId);
  }

  @Patch(':id/removeTask/:taskId')
  @ApiOperation({ summary: 'Remove a task from a calendar' })
  @ApiResponse({ status: 200, description: "Calendar successfully updated" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 404, description: "Calendar not found" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  async removeTask(@Param('id') id: string, @GetUser() user: User, @Param('taskId') taskId: string) {
    return this.calendarService.removeTask(id, user.id, taskId);
  }

  @Patch(':id/removeEvent/:eventId')
  @ApiOperation({ summary: 'Remove a Event from a calendar' })
  @ApiResponse({ status: 200, description: "Calendar successfully updated" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 404, description: "Calendar not found" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  async removeEvent(@Param('id') id: string, @GetUser() user: User, @Param('eventId') eventId: string) {
    return this.calendarService.removeEvent(id, user.id, eventId);
  }

  @Patch(':id/removeReminder/:reminderId')
  @ApiOperation({ summary: 'Remove a Reminder from a calendar' })
  @ApiResponse({ status: 200, description: "Calendar successfully updated" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 404, description: "Calendar not found" })
  @ApiResponse({ status: 403, description: "Unauthorized access" })
  async removeReminder(@Param('id') id: string, @GetUser() user: User, @Param('reminderId') reminderId: string) {
    return this.calendarService.removeReminder(id, user.id, reminderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a calendar by id' })
  @ApiResponse({ status: 200, description: 'Calendar retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findOne(id, user.id);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Retrieve all tasks from a calendar' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findTasks(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findTasks(id, user.id);
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Retrieve all events from a calendar' })
  @ApiResponse({ status: 200, description: 'Events retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findEvents(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findEvents(id, user.id);
  }

  @Get(':id/reminders')
  @ApiOperation({ summary: 'Retrieve all reminders from a calendar' })
  @ApiResponse({ status: 200, description: 'Reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findReminders(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findReminders(id, user.id);
  }

  @Get(':id/today')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from today' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findToday(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findToday(id, user.id);
  }

  @Get(':id/week')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from this week' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findWeek(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findWeek(id, user.id);
  }

  @Get(':id/month')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from this month' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findMonth(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findMonth(id, user.id);
  }

  @Get(':id/year')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from this year' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findYear(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findYear(id, user.id);
  }

  @Get(':id/nextWeek')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from next week' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findNextWeek(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findNextWeek(id, user.id);
  }

  @Get(':id/nextMonth')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from next month' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findNextMonth(@Param('id') id: string, @GetUser() user: User) {
    return this.calendarService.findNextMonth(id, user.id);
  }

  @Get(':id/:date')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from a specific date' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findDate(@Param('id') id: string, @Param('date') date: string, @GetUser() user: User) {
    return this.calendarService.findDate(id, user.id, date);
  }

  @Get(':id/:startDate/:endDate')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from a date range' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findRange(@Param('id') id: string, @Param('startDate') startDate: string, @Param('endDate') endDate: string, @GetUser() user: User) {
    return this.calendarService.findRange(id, user.id, startDate, endDate);
  }

  @Get(':id/:category')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from a specific category' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findCategory(@Param('id') id: string, @Param('category') category: string, @GetUser() user: User) {
    return this.calendarService.findCategory(id, user.id, category);
  }

  @Get(':id/:priority')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from a specific priority' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findPriority(@Param('id') id: string, @Param('priority') priority: string, @GetUser() user: User) {
    return this.calendarService.findPriority(id, user.id, priority);
  }

  @Get(':id/:status')
  @ApiOperation({ summary: 'Retrieve all tasks, events and reminders from a specific status' })
  @ApiResponse({ status: 200, description: 'Tasks, events and reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findStatus(@Param('id') id: string, @Param('status') status: string, @GetUser() user: User) {
    return this.calendarService.findStatus(id, user.id, status);
  }

  @Get(':id/:startDate/:endDate/tasks')
  @ApiOperation({ summary: 'Retrieve all tasks from a date range' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findTasksDate(@Param('id') id: string, @Param('startDate') startDate: string, @Param('endDate') endDate: string, @GetUser() user: User) {
    return this.calendarService.findTasksDate(id, user.id, startDate, endDate);
  }

  @Get(':id/:startDate/:endDate/events')
  @ApiOperation({ summary: 'Retrieve all events from a date range' })
  @ApiResponse({ status: 200, description: 'Events retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findEventsDate(@Param('id') id: string, @Param('startDate') startDate: string, @Param('endDate') endDate: string, @GetUser() user: User) {
    return this.calendarService.findEventsDate(id, user.id, startDate, endDate);
  }

  @Get(':id/:startDate/:endDate/reminders')
  @ApiOperation({ summary: 'Retrieve all reminders from a date range' })
  @ApiResponse({ status: 200, description: 'Reminders retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async findRemindersDate(@Param('id') id: string, @Param('startDate') startDate: string, @Param('endDate') endDate: string, @GetUser() user: User) {
    return this.calendarService.findRemindersDate(id, user.id, startDate, endDate);
  }






  // @Get("tasks")
  // @ApiOperation({ summary: "Get tasks by filters" })
  // @ApiQuery({
  //   name: "startDate",
  //   required: false,
  //   example: "2025-02-24T00:00:00Z",
  // })
  // @ApiQuery({
  //   name: "endDate",
  //   required: false,
  //   example: "2025-02-28T23:59:59Z",
  // })
  // @ApiQuery({ name: "status", required: false, example: "completed | pending" })
  // async getTasks(
  //   @GetUser() user: User,
  //   @Query("startDate") startDate?: string,
  //   @Query("endDate") endDate?: string,
  //   @Query("status") status?: string,
  // ) {
  //   return this.calendarService.getTasks(user.id, startDate, endDate, status);
  // }

  // @Get("events")
  // @ApiOperation({ summary: "Get events by filters" })
  // @ApiQuery({
  //   name: "startDate",
  //   required: false,
  //   example: "2025-02-24T00:00:00Z",
  // })
  // @ApiQuery({
  //   name: "endDate",
  //   required: false,
  //   example: "2025-02-28T23:59:59Z",
  // })
  // @ApiQuery({
  //   name: "category",
  //   required: false,
  //   example: "meeting | study | personal",
  // })
  // async getEvents(
  //   @GetUser() user: User,
  //   @Query("startDate") startDate?: string,
  //   @Query("endDate") endDate?: string,
  //   @Query("category") category?: string,
  // ) {
  //   return this.calendarService.getEvents(
  //     user.id,
  //     startDate,
  //     endDate,
  //     category,
  //   );
  // }

  // @Get("reminders")
  // @ApiOperation({ summary: "Get reminders by filters" })
  // @ApiQuery({
  //   name: "startDate",
  //   required: false,
  //   example: "2025-02-24T00:00:00Z",
  // })
  // @ApiQuery({
  //   name: "endDate",
  //   required: false,
  //   example: "2025-02-28T23:59:59Z",
  // })
  // @ApiQuery({
  //   name: "priority",
  //   required: false,
  //   example: "high | medium | low",
  // })
  // async getReminders(
  //   @GetUser() user: User,
  //   @Query("startDate") startDate?: string,
  //   @Query("endDate") endDate?: string,
  //   @Query("priority") priority?: string,
  // ) {
  //   return this.calendarService.getReminders(
  //     user.id,
  //     startDate,
  //     endDate,
  //     priority,
  //   );
  // }
}