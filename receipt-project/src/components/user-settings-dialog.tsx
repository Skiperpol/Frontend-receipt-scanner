import { useState } from "react";

// Dialog from shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function UserSettingsDialog({
  open,
  onOpenChange,
  user,
  token,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { username: string; email: string };
  token: string | null;
}) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { fetchUser } = useAuth();

  // Aktualizacja username
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      // Zmień na swoje API
      await apiFetch(
        "/auth/user/",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        },
        token || undefined
      );

      console.log("NavUser - zapisuję imię:", username);
      await fetchUser();
      console.log("NavUser - aktualny user:", user);
      setMsg("Imię zapisane!");
    } catch {
      setMsg("Błąd zapisu imienia.");
    } finally {
      setLoading(false);
    }
  };

  // Zmiana hasła
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      // Zmień na swoje API endpoint
      await apiFetch(
        "/auth/password/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
        token || undefined
      );

      setMsg("Hasło zmienione!");
      setPassword("");
    } catch {
      setMsg("Błąd zmiany hasła.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ustawienia użytkownika</DialogTitle>
          <DialogDescription>
            Możesz zmienić imię wyświetlane w systemie i hasło do konta.
          </DialogDescription>
        </DialogHeader>

        {/* Formularz zmiany imienia */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-medium">Imię</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              Zapisz imię
            </Button>
          </DialogFooter>
        </form>

        {/* Formularz zmiany hasła */}
        <form onSubmit={handleChangePassword} className="space-y-4 mt-6">
          <div>
            <label className="block mb-1 text-xs font-medium">Nowe hasło</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              minLength={6}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !password}>
              Zmień hasło
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Zamknij
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>

        {msg && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            {msg}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
