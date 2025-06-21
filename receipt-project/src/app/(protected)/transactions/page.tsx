// app/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  TransactionsTable,
  Transaction,
} from "@/components/transactions-table";

export default function TransactionsPage() {
  const { token } = useAuth();
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
    <div>
      <TransactionsTable data={txs} />
    </div>
  );
}
