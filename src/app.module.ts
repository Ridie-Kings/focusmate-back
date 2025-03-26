import { join } from "path";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { UsersModule } from "./users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RemindersModule } from './reminders/reminders.module';
import { TimerModule } from './timer/timer.module';
import { ConfigModule } from "@nestjs/config";
import { TokenBlacklistModule } from './token-black-list/token-black-list.module';
import { DictsModule } from "./dicts/dicts.module";
import { GamificationProfileModule } from './gamification-profile/gamification-profile.module';
//import { EventsModule } from './events/events.module';
import { BadgesModule } from './badges/badges.module';
import { RedisModule } from "./redis/redis.module";
//import { RewardsModule } from './rewards/rewards.module';
import { RewardsModule } from './rewards/rewards.module';
import { TitlesModule } from './titles/titles.module';
import { BannersModule } from './banners/banners.module';
import { FramesModule } from './frames/frames.module';
import { AvatarsModule } from './avatars/avatars.module';
import { HabitsModule } from './habits/habits.module';
import { TasksModule } from './tasks/tasks.module';
import { QuestsModule } from './quests/quests.module';
import { CalendarModule } from './calendar/calendar.module';
import { EventsCalendarModule } from './events-calendar/events-calendar.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { UserLogsModule } from './user-logs/user-logs.module';
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SectionsModule } from './sections/sections.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60000, // 1 minute
        limit: 10,
      },
    ]),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
    }),
    MongooseModule.forRoot(
      "mongodb+srv://matisargo:OWHtedoTp8gCz5PI@cluster0.ay2g7.mongodb.net/sherpapp",
    ),
    ConfigModule.forRoot({ isGlobal: true }),

    EventEmitterModule.forRoot(
      {wildcard: false, }
    ),

    UsersModule,

    CommonModule,

    AuthModule,

    RemindersModule,

    TimerModule,

    TokenBlacklistModule,

    DictsModule,

    GamificationProfileModule,

    BadgesModule,
    
    RedisModule,
    
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
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
