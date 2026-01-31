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
    const info = await this.streamingService.getStreamInfo(fileId);
    const { fileSize, mimeType, storageKey } = info;

    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = await this.streamingService.getReadStream(
        storageKey,
        start,
        end,
      );

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
      });

      stream.pipe(res);
    } else {
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
      stream.pipe(res);
    }
  }

  @Get(':fileId/info')
  async getFileInfo(@Param('fileId') fileId: string) {
    const info = await this.streamingService.getStreamInfo(fileId);
    return {
      fileSize: info.fileSize,
      mimeType: info.mimeType,
    };
  }
}
