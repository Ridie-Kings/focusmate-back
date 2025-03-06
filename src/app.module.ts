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
import { ReminderModule } from './reminder/reminder.module';
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
import { TittlesModule } from './tittles/tittles.module';
import { BannersModule } from './banners/banners.module';
import { FramesModule } from './frames/frames.module';
import { AvatarsModule } from './avatars/avatars.module';
import { HabitsModule } from './habits/habits.module';
import { TasksModule } from './quests/tasks/tasks.module';
import { TasksQuestsModule } from './tasks-quests/tasks-quests.module';
import { TasksModule } from './tasks/tasks.module';
import { QuestsModule } from './quests/quests.module';
import { TitlesModule } from './titles/titles.module';

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

    UsersModule,

    CommonModule,

    AuthModule,

    ReminderModule,

    TimerModule,

    TokenBlacklistModule,

    DictsModule,

    GamificationProfileModule,

    BadgesModule,
    
    RedisModule,
    
    RewardsModule,
    
    TittlesModule,
    
    BannersModule,
    
    FramesModule,
    
    AvatarsModule,
    
    HabitsModule,
    
    TasksModule,
    
    TasksQuestsModule,
    
    QuestsModule,
    
    TitlesModule,
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
