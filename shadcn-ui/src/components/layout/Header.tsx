import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, User as UserIcon, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/auth';
import { notificationsStorage } from '@/lib/storage';
import { User } from '@/types';

interface HeaderProps {
  user: User | null;
  onUserUpdate: (user: User | null) => void;
}

/**
 * A header component that displays the application title, notification icon, and user menu.
 * @param {HeaderProps} props - The component props.
 * @param {User | null} props.user - The current user object.
 * @param {function} props.onUserUpdate - A callback function to update the user state.
 * @returns The rendered component.
 */
export default function Header({ user, onUserUpdate }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useState(() => {
    if (user) {
      const count = notificationsStorage.getUnreadCount(user.id);
      setUnreadCount(count);
    }
  });

  const handleLogout = async () => {
    await logout();
    onUserUpdate(null);
    window.location.reload();
  };

  if (!user) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-blue-600">🚗 Campus Carpool</h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user.firstName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}