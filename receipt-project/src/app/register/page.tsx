"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { login, token } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password1 !== password2) {
      setError("Hasła nie są identyczne");
      return;
    }
    try {
      const data = await apiFetch("/auth/registration/", {
        method: "POST",
        body: JSON.stringify({ username, email, password1, password2 }),
      });
      login(data.token);
      router.push("/transactions");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (token) {
      router.push("/transactions");
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Rejestracja</CardTitle>
          <CardDescription>Utwórz konto, aby zacząć.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Nazwa użytkownika</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password1">Hasło</Label>
              <Input
                id="password1"
                type="password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password2">Powtórz hasło</Label>
              <Input
                id="password2"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Zarejestruj się
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
