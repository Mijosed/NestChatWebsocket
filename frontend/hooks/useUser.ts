'use client';

import { useEffect, useState } from 'react';

type User = { sub: string; email: string } | null;

export function useUser(): User {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ sub: payload.sub, email: payload.email });
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}
