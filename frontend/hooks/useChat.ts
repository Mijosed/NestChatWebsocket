'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '@/lib/api';

export type Reaction = { id: string; emoji: string; user: { id: string; username: string } };
export type Message = {
  id: string;
  content: string;
  created: string;
  user: { id: string; username: string | null; color: string };
  reactions: Reaction[];
};

export function useChat(roomId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io('http://localhost:3000', { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('typing', ({ users }: { users: string[] }) => {
      setTypingUsers(users);
    });

    socket.on('reaction', ({ messageId, reaction, userId, emoji }: {
      messageId: string;
      reaction: Reaction | null;
      userId: string;
      emoji: string;
    }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          if (reaction === null) {
            return { ...msg, reactions: msg.reactions.filter((r) => !(r.user.id === userId && r.emoji === emoji)) };
          }
          const exists = msg.reactions.find((r) => r.id === reaction.id);
          if (exists) return msg;
          return { ...msg, reactions: [...msg.reactions, reaction] };
        }),
      );
    });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !roomId) return;
    socket.emit('join', roomId);
    return () => { socket.emit('leave', roomId); };
  }, [roomId]);

  function sendMessage(content: string) {
    if (!roomId) return;
    socketRef.current?.emit('message', { roomId, content });
  }

  function sendTyping(isTyping: boolean) {
    if (!roomId) return;
    socketRef.current?.emit('typing', { roomId, isTyping });
  }

  function sendReaction(messageId: string, emoji: string) {
    if (!roomId) return;
    socketRef.current?.emit('reaction', { messageId, emoji, roomId });
  }

  return { messages, setMessages, typingUsers, connected, sendMessage, sendTyping, sendReaction };
}
