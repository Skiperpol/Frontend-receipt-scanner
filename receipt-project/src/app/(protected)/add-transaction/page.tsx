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
  // const [total, setTotal] = useState("");
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
            // total_amount: total,
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
        className="grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-end"
      >
        {/* DATA */}
        <label className="text-sm font-medium mb-1" htmlFor="date">
          Data
        </label>
        <label className="text-sm font-medium mb-1" htmlFor="desc">
          Opis
        </label>

        <Input
          id="date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-fit"
        />
        <Input
          id="desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
          className="w-full"
        />

        <div className="col-span-2 flex justify-end mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Tworzenie..." : "Utwórz transakcję"}
          </Button>
        </div>
      </form>
    </div>
  );
}
