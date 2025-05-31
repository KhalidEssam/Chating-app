'use client';

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setUser(null);
    }
  }, []);

  return user;
}
