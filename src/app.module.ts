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
