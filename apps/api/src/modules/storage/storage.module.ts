import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageProvider } from './storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: StorageProvider,
      useFactory: (config: ConfigService): StorageProvider => {
        const provider = config.get('STORAGE_PROVIDER', 'local');
        if (provider === 'azure') {
          // Azure provider will be added in Phase 5
          throw new Error('Azure storage not yet implemented');
        }
        return new LocalStorageProvider(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [StorageProvider],
})
export class StorageModule {}
