'use client';

import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Page() {
  const user = useUser();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">
        Bienvenue, {user?.email ?? '...'}
      </h1>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/chat">Accéder au chat</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account">Mon profil</Link>
        </Button>
      </div>
    </div>
  );
}
