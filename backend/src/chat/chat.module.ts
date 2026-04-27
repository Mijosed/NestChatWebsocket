import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessageModule } from '../message/message.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [AuthModule, MessageModule],
  providers: [ChatGateway],
})
export class ChatModule {}
