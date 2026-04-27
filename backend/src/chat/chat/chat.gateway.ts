import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../../message/message.service';

interface AuthSocket extends Socket {
  user: { sub: string; email: string; username?: string };
}

@WebSocketGateway({ cors: { origin: 'http://localhost:3001' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private typingUsers = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private messageService: MessageService,
  ) {}

  async handleConnection(client: AuthSocket) {
    const token = client.handshake.auth.token as string;
    try {
      const payload = await this.jwtService.verifyAsync(token);
      client.user = payload;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (!client.user) return;
    this.typingUsers.forEach((users, roomId) => {
      if (users.delete(client.user.sub)) {
        this.server.to(roomId).emit('typing', { users: [...users] });
      }
    });
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: AuthSocket, @MessageBody() roomId: string) {
    client.join(roomId);
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: AuthSocket, @MessageBody() roomId: string) {
    client.leave(roomId);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { roomId: string; content: string },
  ) {
    const message = await this.messageService.create(
      payload.content,
      client.user.sub,
      payload.roomId,
    );
    this.server.to(payload.roomId).emit('message', message);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { roomId: string; isTyping: boolean },
  ) {
    if (!this.typingUsers.has(payload.roomId)) {
      this.typingUsers.set(payload.roomId, new Set());
    }
    const users = this.typingUsers.get(payload.roomId)!;

    if (payload.isTyping) {
      users.add(client.user.username ?? client.user.email);
    } else {
      users.delete(client.user.username ?? client.user.email);
    }

    client.to(payload.roomId).emit('typing', { users: [...users] });
  }

  @SubscribeMessage('reaction')
  async handleReaction(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { messageId: string; emoji: string; roomId: string },
  ) {
    const reaction = await this.messageService.addReaction(
      payload.messageId,
      client.user.sub,
      payload.emoji,
    );
    this.server.to(payload.roomId).emit('reaction', {
      messageId: payload.messageId,
      emoji: payload.emoji,
      reaction,
      userId: client.user.sub,
    });
  }
}
