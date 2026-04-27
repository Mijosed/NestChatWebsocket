import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(content: string, userId: string, roomId: string) {
    return this.prisma.message.create({
      data: { content, userId, roomId },
      include: {
        user: { select: { id: true, username: true, color: true } },
        reactions: { include: { user: { select: { id: true, username: true } } } },
      },
    });
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    const existing = await this.prisma.reaction.findUnique({
      where: { userId_messageId_emoji: { userId, messageId, emoji } },
    });

    if (existing) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
      return null;
    }

    return this.prisma.reaction.create({
      data: { emoji, userId, messageId },
      include: { user: { select: { id: true, username: true } } },
    });
  }
}
