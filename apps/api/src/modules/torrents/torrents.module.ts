import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TorrentEntity } from './entities/torrent.entity';
import { TorrentFileEntity } from './entities/torrent-file.entity';
import { TorrentEngineService } from './torrent-engine.service';
import { TorrentsService } from './torrents.service';
import { TorrentsController } from './torrents.controller';
import { TorrentsGateway } from './gateways/torrents.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([TorrentEntity, TorrentFileEntity])],
  providers: [TorrentEngineService, TorrentsService, TorrentsGateway],
  controllers: [TorrentsController],
  exports: [TorrentsService, TorrentEngineService],
})
export class TorrentsModule {}
