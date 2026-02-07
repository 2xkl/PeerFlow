import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import { StreamingService } from './streaming.service';

@Controller('stream')
export class StreamingController {
  private readonly logger = new Logger(StreamingController.name);

  constructor(private readonly streamingService: StreamingService) {}

  @Get(':fileId')
  async streamFile(
    @Param('fileId') fileId: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    this.logger.log(`[STREAM START] fileId=${fileId}`);

    try {
      const info = await this.streamingService.getStreamInfo(fileId);
      const { fileSize, mimeType, storageKey } = info;

      this.logger.log(`[STREAM INFO] storageKey=${storageKey}, size=${fileSize}, mime=${mimeType}`);

      const range = req.headers.range;
      this.logger.log(`[STREAM RANGE] header=${range || 'none'}`);

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        this.logger.log(`[STREAM CHUNK] start=${start}, end=${end}, chunkSize=${chunkSize}`);

        const stream = await this.streamingService.getReadStream(
          storageKey,
          start,
          end,
        );

        stream.on('error', (err) => {
          this.logger.error(`[STREAM ERROR] ${err.message}`);
          if (!res.headersSent) {
            res.status(500).send('Stream error');
          }
        });

        stream.on('end', () => {
          this.logger.log(`[STREAM END] chunk ${start}-${end} completed`);
        });

        stream.on('close', () => {
          this.logger.log(`[STREAM CLOSE] stream closed`);
        });

        res.on('close', () => {
          this.logger.log(`[RESPONSE CLOSE] client disconnected`);
          stream.destroy();
        });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': mimeType,
        });

        stream.pipe(res);
      } else {
        this.logger.log(`[STREAM FULL] sending full file, size=${fileSize}`);

        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': mimeType,
          'Accept-Ranges': 'bytes',
        });

        const stream = await this.streamingService.getReadStream(
          storageKey,
          0,
          fileSize - 1,
        );

        stream.on('error', (err) => {
          this.logger.error(`[STREAM ERROR] ${err.message}`);
        });

        stream.on('end', () => {
          this.logger.log(`[STREAM END] full file completed`);
        });

        res.on('close', () => {
          this.logger.log(`[RESPONSE CLOSE] client disconnected`);
          stream.destroy();
        });

        stream.pipe(res);
      }
    } catch (err: any) {
      this.logger.error(`[STREAM FATAL] ${err.message}`, err.stack);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  }

  @Get(':fileId/info')
  async getFileInfo(@Param('fileId') fileId: string) {
    this.logger.log(`[INFO REQUEST] fileId=${fileId}`);
    const info = await this.streamingService.getStreamInfo(fileId);
    this.logger.log(`[INFO RESULT] size=${info.fileSize}, mime=${info.mimeType}`);
    return {
      fileSize: info.fileSize,
      mimeType: info.mimeType,
    };
  }
}
