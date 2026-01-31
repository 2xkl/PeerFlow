import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TorrentsModule } from './modules/torrents/torrents.module';
import { StreamingModule } from './modules/streaming/streaming.module';
import { StorageModule } from './modules/storage/storage.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'peerflow',
      password: process.env.DB_PASSWORD || 'peerflow_secret',
      database: process.env.DB_NAME || 'peerflow',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    StorageModule,
    TorrentsModule,
    StreamingModule,
    HealthModule,
  ],
})
export class AppModule {}
