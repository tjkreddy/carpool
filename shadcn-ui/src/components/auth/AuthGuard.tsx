import { useEffect, useState } from "react";
import { isAuthenticated, getCurrentUser, generateToken } from "@/lib/auth";
import { User } from "@/types";
import { initializeDemoUser, userStorage } from "@/lib/storage";
import LoginForm from "./LoginForm";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * A component that guards routes, ensuring a user is authenticated before rendering its children.
 * If the user is not authenticated, it displays a login form.
 * For demo purposes, it can auto-login a demo user.
 * @param {AuthGuardProps} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if authenticated.
 * @returns The rendered component.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } else {
        // Auto-login with demo user for now
        initializeDemoUser();
        const token = generateToken();
        userStorage.setToken(token);
        const demoUser = getCurrentUser();
        if (demoUser) {
          setUser(demoUser);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={(user) => setUser(user)} />;
  }

  return <>{children}</>;
}
