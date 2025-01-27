import { join } from "path";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { UsersModule } from "./users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
<<<<<<< HEAD
import { CommonModule } from "./common/common.module";
=======
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';

>>>>>>> origin/juanan_branch

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
    }),
    MongooseModule.forRoot(
      "mongodb+srv://matisargo:OWHtedoTp8gCz5PI@cluster0.ay2g7.mongodb.net/sherpapp",
    ),


    UsersModule,

    CommonModule,
<<<<<<< HEAD
=======

    AuthModule,

>>>>>>> origin/juanan_branch
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
