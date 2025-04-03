import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Stat, StatSchema } from './entities/stats.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: Stat.name, schema: StatSchema}])], // Aquí puedes importar otros módulos si es necesario
  providers: [StatsService],
  exports: [StatsService], // Exporta el servicio si lo necesitas en otros módulos
})
export class StatsModule {}
