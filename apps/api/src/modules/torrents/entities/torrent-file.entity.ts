import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TorrentEntity } from './torrent.entity';

@Entity('torrent_files')
export class TorrentFileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'torrent_id' })
  torrentId: string;

  @ManyToOne(() => TorrentEntity, (torrent) => torrent.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'torrent_id' })
  torrent: TorrentEntity;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'size_bytes', type: 'bigint', default: 0 })
  sizeBytes: number;

  @Column({ name: 'mime_type', type: 'varchar', nullable: true })
  mimeType: string | null;

  @Column({ name: 'is_video', default: false })
  isVideo: boolean;

  @Column({ name: 'storage_key', type: 'varchar', nullable: true })
  storageKey: string | null;
}
