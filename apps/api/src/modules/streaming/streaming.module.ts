import { Module } from '@nestjs/common';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';
import { TorrentsModule } from '../torrents/torrents.module';

@Module({
  imports: [TorrentsModule],
  controllers: [StreamingController],
  providers: [StreamingService],
})
export class StreamingModule {}
