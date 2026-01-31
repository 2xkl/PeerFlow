import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TorrentsService } from './torrents.service';
import { AddTorrentDto } from './dto/add-torrent.dto';

@Controller('torrents')
export class TorrentsController {
  constructor(private readonly torrentsService: TorrentsService) {}

  @Get()
  findAll() {
    return this.torrentsService.findAll();
  }

  @Post()
  addTorrent(@Body() dto: AddTorrentDto) {
    return this.torrentsService.addTorrent(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.torrentsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('deleteFiles') deleteFiles?: string) {
    return this.torrentsService.remove(id, deleteFiles === 'true');
  }

  @Post(':id/pause')
  pause(@Param('id') id: string) {
    return this.torrentsService.pause(id);
  }

  @Post(':id/resume')
  resume(@Param('id') id: string) {
    return this.torrentsService.resume(id);
  }

  @Get(':id/files')
  async getFiles(@Param('id') id: string) {
    const torrent = await this.torrentsService.findOne(id);
    return torrent.files;
  }
}
