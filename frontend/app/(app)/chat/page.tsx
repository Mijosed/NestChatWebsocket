'use client';

import { useEffect, useState } from 'react';
import { createRoom, getRooms, getUsers, addRoomMember } from '@/lib/api';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type Room = {
  id: string;
  name: string;
  creatorId: string | null;
  members: { user: { id: string; username: string | null } }[];
};
type User = { id: string; email: string; username: string | null };

const GENERAL = 'Général';

export default function ChatPage() {
  const currentUser = useUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showInvite, setShowInvite] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [hasHistory, setHasHistory] = useState(true);

  useEffect(() => {
    getRooms().then(setRooms);
    getUsers().then(setUsers);
  }, []);

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      const room = await createRoom(newRoomName.trim());
      setRooms((prev) => [...prev, room]);
      setNewRoomName('');
    } finally {
      setCreating(false);
    }
  }

  async function handleInvite(roomId: string) {
    if (!selectedUser) return;
    await addRoomMember(roomId, selectedUser, hasHistory);
    setShowInvite(null);
    setSelectedUser('');
    getRooms().then(setRooms);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Salons de discussion</h1>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <Input
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="Nom du nouveau salon..."
        />
        <Button type="submit" disabled={creating}>
          Créer
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        {rooms.map((room) => {
          const isGeneral = room.name === GENERAL;
          const isCreator = room.creatorId === currentUser?.sub;

          return (
            <Card key={room.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{room.name}</CardTitle>
                  <div className="flex gap-2">
                    {isCreator && !isGeneral && (
                      <Button variant="outline" size="sm" onClick={() => setShowInvite(room.id)}>
                        Inviter
                      </Button>
                    )}
                    <Button size="sm" asChild>
                      <Link href={`/chat/${room.id}`}>Se connecter</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {room.members.length} membre(s) :{' '}
                  {room.members.map((m) => m.user.username ?? 'inconnu').join(', ')}
                </p>

                {showInvite === room.id && (
                  <div className="mt-3 flex flex-col gap-2 rounded border p-3">
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="rounded border p-2 text-sm"
                    >
                      <option value="">Choisir un utilisateur...</option>
                      {users
                        .filter((u) => !room.members.find((m) => m.user.id === u.id))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username ?? u.email}
                          </option>
                        ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={hasHistory}
                        onChange={(e) => setHasHistory(e.target.checked)}
                      />
                      Accès à l&apos;historique
                    </label>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleInvite(room.id)}>
                        Inviter
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowInvite(null)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
