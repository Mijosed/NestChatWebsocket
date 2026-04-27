'use client';

import { useEffect, useState } from 'react';
import { getMe, updateMe } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type User = { id: string; email: string; username: string | null; color: string };

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getMe().then((u: User) => {
      setUser(u);
      setUsername(u.username ?? '');
      setColor(u.color);
    });
  }, []);

  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const updated = await updateMe({ username: username || undefined, color });
      setUser(updated);
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input value={user?.email ?? ''} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nom d&apos;utilisateur</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="votre pseudo"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Couleur d&apos;affichage</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded border"
                />
                <span className="text-sm font-mono">{color}</span>
                <span
                  className="rounded px-2 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  {username || user?.email}
                </span>
              </div>
            </div>
            {success && <p className="text-sm text-green-500">Profil mis à jour !</p>}
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
