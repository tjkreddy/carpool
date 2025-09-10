import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { register } from "@/lib/auth";
import { User, RegisterData } from "@/types";

interface RegisterFormProps {
  onRegister: (user: User) => void;
}

/**
 * A component that provides a form for new users to register.
 * @param {RegisterFormProps} props - The component props.
 * @param {function} props.onRegister - A callback function that is called when the user successfully registers.
 * @returns The rendered component.
 */
export default function RegisterForm({ onRegister }: RegisterFormProps) {
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    studentId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await register(registerData);
      onRegister(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={registerData.firstName}
            onChange={(e) =>
              setRegisterData({ ...registerData, firstName: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={registerData.lastName}
            onChange={(e) =>
              setRegisterData({ ...registerData, lastName: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Mahindra University Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.name@mahindrauniversity.edu.in"
          value={registerData.email}
          onChange={(e) =>
            setRegisterData({ ...registerData, email: e.target.value })
          }
          required
        />
        <p className="text-xs text-muted-foreground">
          Use your official Mahindra University email address
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1-555-0123"
          value={registerData.phoneNumber}
          onChange={(e) =>
            setRegisterData({ ...registerData, phoneNumber: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          value={registerData.password}
          onChange={(e) =>
            setRegisterData({ ...registerData, password: e.target.value })
          }
          required
          minLength={6}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By registering, you agree to verify your identity with your college
        email
      </p>
    </form>
  );
}
