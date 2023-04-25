import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'status', cors: { origin: '*' } })
export class StatusGateway {
  @SubscribeMessage('testStatus')
  test(@MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    console.log(data);
    return data;
  }
}
