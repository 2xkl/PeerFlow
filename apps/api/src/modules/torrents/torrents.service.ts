import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as mime from 'mime-types';
import { TorrentEntity, TorrentStatus } from './entities/torrent.entity';
import { TorrentFileEntity } from './entities/torrent-file.entity';
import { TorrentEngineService, TorrentState } from './torrent-engine.service';
import { AddTorrentDto } from './dto/add-torrent.dto';
import { isVideoFile } from '@peerflow/shared';

@Injectable()
export class TorrentsService {
  private readonly logger = new Logger(TorrentsService.name);

  constructor(
    @InjectRepository(TorrentEntity)
    private readonly torrentRepo: Repository<TorrentEntity>,
    @InjectRepository(TorrentFileEntity)
    private readonly fileRepo: Repository<TorrentFileEntity>,
    private readonly engine: TorrentEngineService,
  ) {}

  async onModuleInit() {
    await this.engine.waitForReady();
    await this.restoreActiveTorrents();
  }

  async addTorrent(dto: AddTorrentDto): Promise<TorrentEntity> {
    let state: TorrentState;

    if (dto.magnetUri) {
      state = await this.engine.addMagnet(dto.magnetUri);
    } else if (dto.torrentFile) {
      const buffer = Buffer.from(dto.torrentFile, 'base64');
      state = await this.engine.addTorrentFile(buffer);
    } else {
      throw new Error('Either magnetUri or torrentFile is required');
    }

    const existing = await this.torrentRepo.findOne({
      where: { infoHash: state.infoHash },
    });
    if (existing) {
      throw new ConflictException('Torrent already exists');
    }

    const torrent = this.torrentRepo.create({
      infoHash: state.infoHash,
      name: state.name,
      magnetUri: dto.magnetUri || null,
      status: TorrentStatus.DOWNLOADING,
      progress: 0,
      sizeBytes: state.size,
      downloadedBytes: 0,
      savePath: state.infoHash,
    });

    const savedTorrent = await this.torrentRepo.save(torrent);

    for (const f of state.files) {
      const file = this.fileRepo.create({
        torrentId: savedTorrent.id,
        filePath: f.path,
        sizeBytes: f.length,
        mimeType: mime.lookup(f.name) || null,
        isVideo: isVideoFile(f.name),
        storageKey: f.path,
      });
      await this.fileRepo.save(file);
    }

    this.logger.log(`Added torrent: ${state.name} (${state.infoHash})`);

    return this.findOne(savedTorrent.id);
  }

  async findAll(): Promise<TorrentEntity[]> {
    const torrents = await this.torrentRepo.find({
      relations: ['files'],
      order: { createdAt: 'DESC' },
    });

    // Enrich with live state from engine
    for (const torrent of torrents) {
      const state = this.engine.getTorrentState(torrent.infoHash);
      if (state) {
        torrent.progress = Math.round(state.progress * 10000) / 100;
        torrent.downloadedBytes = state.downloaded;
        if (state.done && torrent.status === TorrentStatus.DOWNLOADING) {
          torrent.status = TorrentStatus.COMPLETED;
          await this.torrentRepo.save(torrent);
        }
      }
    }

    return torrents;
  }

  async findOne(id: string): Promise<TorrentEntity> {
    const torrent = await this.torrentRepo.findOne({
      where: { id },
      relations: ['files'],
    });
    if (!torrent) throw new NotFoundException('Torrent not found');
    return torrent;
  }

  async remove(id: string, deleteFiles = false): Promise<void> {
    const torrent = await this.findOne(id);
    this.engine.removeTorrent(torrent.infoHash);
    await this.torrentRepo.remove(torrent);
    this.logger.log(`Removed torrent: ${torrent.name}`);
  }

  async pause(id: string): Promise<TorrentEntity> {
    const torrent = await this.findOne(id);
    this.engine.pauseTorrent(torrent.infoHash);
    torrent.status = TorrentStatus.PAUSED;
    return this.torrentRepo.save(torrent);
  }

  async resume(id: string): Promise<TorrentEntity> {
    const torrent = await this.findOne(id);
    this.engine.resumeTorrent(torrent.infoHash);
    torrent.status = TorrentStatus.DOWNLOADING;
    return this.torrentRepo.save(torrent);
  }

  async getFile(fileId: string): Promise<TorrentFileEntity> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['torrent'],
    });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  private async restoreActiveTorrents(): Promise<void> {
    const active = await this.torrentRepo.find({
      where: [
        { status: TorrentStatus.DOWNLOADING },
        { status: TorrentStatus.SEEDING },
      ],
    });

    for (const torrent of active) {
      if (torrent.magnetUri && !this.engine.isActive(torrent.infoHash)) {
        try {
          await this.engine.addMagnet(torrent.magnetUri);
          this.logger.log(`Restored torrent: ${torrent.name}`);
        } catch (err: any) {
          this.logger.error(`Failed to restore: ${torrent.name}`, err.message);
          torrent.status = TorrentStatus.ERROR;
          await this.torrentRepo.save(torrent);
        }
      }
    }
  }
}
