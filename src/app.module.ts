import { Module } from "@nestjs/common";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";

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
//import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 10000, // 1 minuto
        limit: 10,
      },
    ]),

    MongooseModule.forRoot(
      "mongodb+srv://matisargo:OWHtedoTp8gCz5PI@cluster0.ay2g7.mongodb.net/sherpapp",
    ),
    ConfigModule.forRoot({ isGlobal: true }),

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
    //SubscriptionsModule,
  ],
  controllers: [AppController, AdminController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService
  ],
})
export class AppModule {}

