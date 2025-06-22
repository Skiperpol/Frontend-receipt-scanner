"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewTransactionPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16);
    setDate(now);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await apiFetch(
        "/transactions/",
        {
          method: "POST",
          body: JSON.stringify({
            date,
            total_amount: 0,
            description: desc,
          }),
        },
        token
      );
      router.push(`/transactions/${created.id}`);
    } catch (error) {
      console.error("Błąd tworzenia transakcji:", error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <form
        onSubmit={handleSubmit}
        className="
        grid grid-cols-1 gap-y-2
        sm:flex sm:items-end sm:gap-x-4
      "
      >
        <div className="w-full max-w-50 min-w-50 sm:w-1/4">
          <label
            htmlFor="date"
            className="block text-sm font-medium mb-1 sm:mb-0"
          >
            Data
          </label>
          <Input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="desc"
            className="block text-sm font-medium mb-1 sm:mb-0"
          >
            Opis
          </label>
          <Input
            id="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="col-span-1 sm:ml-auto mt-4 sm:mt-0">
          <Button type="submit" disabled={loading}>
            {loading ? "Tworzenie..." : "Utwórz transakcję"}
          </Button>
        </div>
      </form>
    </div>
  );
}
