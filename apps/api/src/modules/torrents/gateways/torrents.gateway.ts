import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TorrentEngineService } from '../torrent-engine.service';
import { TORRENT_PROGRESS_INTERVAL_MS } from '@peerflow/shared';

@WebSocketGateway({
  namespace: '/ws/torrents',
  cors: { origin: '*' },
})
export class TorrentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TorrentsGateway.name);
  private interval: NodeJS.Timeout;

  constructor(private readonly engine: TorrentEngineService) {}

  afterInit() {
    this.interval = setInterval(() => {
      const states = this.engine.getAllStates();
      if (states.length > 0) {
        this.logger.debug(`Broadcasting ${states.length} torrent states`);
        this.server.emit('torrent:progress', states);
      }
    }, TORRENT_PROGRESS_INTERVAL_MS);

    this.logger.log('Torrents WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
    // Send current state immediately on connect
    const states = this.engine.getAllStates();
    client.emit('torrent:progress', states);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
