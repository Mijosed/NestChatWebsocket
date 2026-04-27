'use client';

import { logout } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/" className="text-lg">
        <span className="font-semibold">NestChatWebSocket</span>
      </Link>
      <nav className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/chat">Accéder au chat</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/account">Mon profil</Link>
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          Se déconnecter
        </Button>
      </nav>
    </header>
  );
}
