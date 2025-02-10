import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { TimerService } from "./timer.service";
import { StartTimerDto, UpdateTimerDto } from "./dto/index";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetUser } from "src/users/decorators/get-user.decorator";
import { User } from "src/users/entities/user.entity";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("Timers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("timers")
export class TimerController {
  constructor(private readonly timerService: TimerService) {}

  @Post("start")
  @ApiOperation({ summary: "Start a new timer" })
  @ApiResponse({ status: 201, description: "Timer started successfully" })
  startTimer(@Body() startTimerDto: StartTimerDto, @GetUser() user: User) {
    return this.timerService.startTimer(startTimerDto, user._id.toString());
  }

  @Patch("update")
  @ApiOperation({ summary: "Pause, resume or stop a timer" })
  @ApiResponse({ status: 200, description: "Timer updated successfully" })
  updateTimer(@Body() updateTimerDto: UpdateTimerDto, @GetUser() user: User) {
    return this.timerService.updateTimer(updateTimerDto, user._id.toString());
  }

  @Get()
  @ApiOperation({ summary: "Get all user timers" })
  @ApiResponse({
    status: 200,
    description: "List of timers retrieved successfully",
  })
  getTimers(@GetUser() user: User) {
    return this.timerService.getTimers(user._id.toString());
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a timer" })
  @ApiResponse({ status: 200, description: "Timer deleted successfully" })
  deleteTimer(@Param("id") id: string, @GetUser() user: User) {
    return this.timerService.deleteTimer(id, user._id.toString());
  }
}
