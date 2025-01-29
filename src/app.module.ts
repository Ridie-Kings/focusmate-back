import { join } from "path";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { UsersModule } from "./users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // 1 minute
          limit: 20, // limit each IP to 100 requests per minute
        },
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
    }),
    MongooseModule.forRoot(
      "mongodb+srv://matisargo:OWHtedoTp8gCz5PI@cluster0.ay2g7.mongodb.net/sherpapp",
    ),

    UsersModule,

    CommonModule,

    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
