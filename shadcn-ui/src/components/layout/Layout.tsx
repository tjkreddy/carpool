import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onUserUpdate={setUser} />
      
      <main className="pb-20 pt-16">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}