import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stat, StatDocument } from './entities/stats.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Stat.name)
    private readonly statModel: Model<StatDocument>,
  ) {}

  
}
