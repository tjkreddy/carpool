import { useEffect, useState } from "react";
import {
  isAuthenticatedWithSupabase,
  getCurrentUserFromSupabase,
} from "@/lib/auth";
import { User } from "@/types";
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
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticatedWithSupabase();
        if (authenticated) {
          const currentUser = await getCurrentUserFromSupabase();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Don't create demo user on auth errors - let user see the login form
        // For development, you can uncomment the demo user creation below
        /*
        setUser({
          id: "demo-user",
          firstName: "Demo",
          lastName: "User",
          email: "demo@mahindrauniversity.edu.in",
          phoneNumber: "+1234567890",
          collegeId: "mahindra-university",
          studentId: "123456",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        */
      } finally {
        setLoading(false);
      }
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
