'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { getRoomMessages } from '@/lib/api';
import { useChat } from '@/hooks/useChat';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const currentUser = useUser();
  const { messages, setMessages, typingUsers, sendMessage, sendTyping, sendReaction } = useChat(roomId);
  const [input, setInput] = useState('');
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRoomMessages(roomId).then(setMessages);
  }, [roomId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  }

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chat">← Salons</Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isMe = msg.user.id === currentUser?.sub;
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}
                onMouseEnter={() => setHoveredMsg(msg.id)}
                onMouseLeave={() => setHoveredMsg(null)}
              >
                <span className="text-xs text-muted-foreground" style={{ color: msg.user.color }}>
                  {msg.user.username ?? msg.user.color}
                </span>
                <div className="relative max-w-xs">
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${isMe ? 'text-white' : 'bg-muted'}`}
                    style={isMe ? { backgroundColor: msg.user.color } : {}}
                  >
                    {msg.content}
                  </div>

                  {hoveredMsg === msg.id && (
                    <div className="absolute -top-8 left-0 flex gap-1 rounded-full border bg-background px-2 py-1 shadow">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          className="text-base hover:scale-125 transition-transform"
                          onClick={() => sendReaction(msg.id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(
                      msg.reactions.reduce<Record<string, string[]>>((acc, r) => {
                        acc[r.emoji] = [...(acc[r.emoji] ?? []), r.user.username ?? '?'];
                        return acc;
                      }, {}),
                    ).map(([emoji, users]) => (
                      <button
                        key={emoji}
                        title={users.join(', ')}
                        onClick={() => sendReaction(msg.id, emoji)}
                        className="flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-xs hover:bg-muted/80"
                      >
                        {emoji} <span>{users.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {typingUsers.length > 0 && (
        <p className="px-4 py-1 text-xs text-muted-foreground">
          {typingUsers.length === 1
            ? `${typingUsers[0]} est en train d'écrire...`
            : `${typingUsers.join(', ')} sont en train d'écrire...`}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t px-4 py-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => sendTyping(true)}
          onBlur={() => sendTyping(false)}
          placeholder="Votre message..."
          autoFocus
        />
        <Button type="submit">Envoyer</Button>
      </form>
    </div>
  );
}
