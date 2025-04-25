import { Module } from "@nestjs/common";
import { APP_GUARD, APP_FILTER } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { Logger } from "@nestjs/common";
import { Stat, StatSchema } from './stats/entities/stats.entity';
import { JwtExceptionFilter } from './auth/filters/jwt-exception.filter';

import { AppController, AdminController } from "./app.controller";
import { AppService } from "./app.service";

// Importa los módulos de tu aplicación
import { UsersModule } from "./users/users.module";
import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";
import { RemindersModule } from './reminders/reminders.module';
import { TimerModule } from './timer/timer.module';
import { TokenBlacklistModule } from './token-black-list/token-black-list.module';
import { DictsModule } from "./dicts/dicts.module";
import { GamificationProfileModule } from './gamification-profile/gamification-profile.module';
import { BadgesModule } from './badges/badges.module';
// import { RedisModule } from "./redis/redis.module";
import { RewardsModule } from './rewards/rewards.module';
import { BannersModule } from './banners/banners.module';
import { FramesModule } from './frames/frames.module';
import { AvatarsModule } from './avatars/avatars.module';
import { HabitsModule } from './habits/habits.module';
import { TasksModule } from './tasks/tasks.module';
import { QuestsModule } from './quests/quests.module';
import { TitlesModule } from './titles/titles.module';
import { CalendarModule } from './calendar/calendar.module';
import { EventsCalendarModule } from './events-calendar/events-calendar.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { UserLogsModule } from './user-logs/user-logs.module';
import { SectionsModule } from './sections/sections.module';
import { NotesModule } from './notes/notes.module';
import { PomodoroModule } from './pomodoro/pomodoro.module';
import { EventsModule } from './events/events.module';
import { StatsModule } from './stats/stats.module';
import { StatsService } from './stats/stats.service';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([{ name: Stat.name, schema: StatSchema }]),

    EventEmitterModule.forRoot(
      { wildcard: false }
    ),

    // Módulos de la aplicación
    UsersModule,
    CommonModule,
    AuthModule,
    RemindersModule,
    TimerModule,
    TokenBlacklistModule,
    DictsModule,
    GamificationProfileModule,
    BadgesModule,
   // RedisModule,
    RewardsModule,
    BannersModule,
    FramesModule,
    AvatarsModule,
    HabitsModule,
    TasksModule,
    QuestsModule,
    TitlesModule,
    CalendarModule,
    EventsCalendarModule,
    ChecklistsModule,
    UserLogsModule,
    SectionsModule,
    NotesModule,
    PomodoroModule,
    EventsModule,
    StatsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController, AdminController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: JwtExceptionFilter,
    },
    AppService
  ],
})
export class AppModule {}

