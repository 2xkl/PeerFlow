import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TorrentFileEntity } from './torrent-file.entity';

export enum TorrentStatus {
  DOWNLOADING = 'downloading',
  SEEDING = 'seeding',
  PAUSED = 'paused',
  ERROR = 'error',
  COMPLETED = 'completed',
}

@Entity('torrents')
export class TorrentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'info_hash', unique: true })
  infoHash: string;

  @Column()
  name: string;

  @Column({ name: 'magnet_uri', type: 'text', nullable: true })
  magnetUri: string | null;

  @Column({ type: 'enum', enum: TorrentStatus, default: TorrentStatus.DOWNLOADING })
  status: TorrentStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ name: 'size_bytes', type: 'bigint', default: 0 })
  sizeBytes: number;

  @Column({ name: 'downloaded_bytes', type: 'bigint', default: 0 })
  downloadedBytes: number;

  @Column({ name: 'save_path', type: 'varchar', nullable: true })
  savePath: string | null;

  @OneToMany(() => TorrentFileEntity, (file) => file.torrent, { cascade: true })
  files: TorrentFileEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
