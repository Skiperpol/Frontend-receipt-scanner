"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

type Product = { id: number; name: string; price: string };
type Transaction = {
  id: number;
  date: string;
  total_amount: string;
  description: string;
  products: Product[];
};

export default function TransactionsPage() {
  const { token, logout } = useAuth();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/transactions/", { method: "GET" }, token)
      .then((data) => setTxs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>Ładowanie…</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Twoje transakcje</h1>
        <Button variant="destructive" onClick={logout}>
          Wyloguj
        </Button>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {txs.map((tx) => (
          <AccordionItem key={tx.id} value={String(tx.id)}>
            <AccordionTrigger>
              #{tx.id} – {new Date(tx.date).toLocaleString()} –{" "}
              {tx.total_amount} PLN
            </AccordionTrigger>
            <AccordionContent className="space-y-1">
              <p>{tx.description}</p>
              <ul className="list-disc list-inside">
                {tx.products.map((p) => (
                  <li key={p.id}>
                    {p.name}: {p.price} PLN
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
