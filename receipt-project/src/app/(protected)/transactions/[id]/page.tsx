// app/transactions/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Product = { id: number; name: string; price: string };
type Transaction = {
  id: number;
  date: string;
  total_amount: string;
  description: string;
  products: Product[];
};

export default function TransactionPage() {
  const { token } = useAuth();
  const router = useRouter();
  const path = usePathname(); // e.g. "/transactions/123"
  const id = path.split("/").pop(); // "123"

  const [tx, setTx] = useState<Transaction | null>(null);
  const [date, setDate] = useState("");
  const [total, setTotal] = useState("");
  const [desc, setDesc] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  // For adding new products
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // For editing existing products
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [loading, setLoading] = useState(true);

  // fetch transaction + products
  useEffect(() => {
    apiFetch(`/transactions/${id}/`, { method: "GET" }, token)
      .then((data: Transaction) => {
        setTx(data);
        setDate(data.date.slice(0, 16)); // YYYY-MM-DDTHH:mm
        setTotal(data.total_amount);
        setDesc(data.description);
        setProducts(data.products);
      })
      .catch(() => router.replace("/transactions"))
      .finally(() => setLoading(false));
  }, [id, token, router]);

  if (loading) return <p className="p-6">Ładowanie…</p>;
  if (!tx) return <p className="p-6">Transakcja nie znaleziona.</p>;

  const saveTransaction = async () => {
    await apiFetch(
      `/transactions/${tx.id}/`,
      {
        method: "PUT",
        body: JSON.stringify({ date, total_amount: total, description: desc }),
      },
      token
    );
    router.refresh();
  };

  const deleteProduct = async (pid: number) => {
    // Optymistyczne usuwanie z UI
    setProducts((p) => p.filter((x) => x.id !== pid));
    // Jeśli aktualnie edytowany produkt to ten sam, zamknij dialog
    if (editProduct?.id === pid) {
      setEditProduct(null);
    }
    try {
      await apiFetch(`/products/${pid}/`, { method: "DELETE" }, token);
    } catch (error) {
      console.error("Błąd usuwania produktu:", error);
      // Opcjonalnie: przywróć produkt w UI lub pokaż komunikat
    }
  };

  const closeEditDialog = () => {
    setEditProduct(null);
    setEditName("");
    setEditPrice("");
  };

  const deleteTransaction = async () => {
    await apiFetch(`/transactions/${id}/`, { method: "DELETE" }, token);
    router.push("/transactions");
  };

  async function saveProduct() {
    if (editProduct) {
      await apiFetch(
        `/products/${editProduct.id}/`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: editName,
            price: editPrice,
            transaction: id,
          }),
        },
        token
      );
      setProducts((ps) =>
        ps.map((p) =>
          p.id === editProduct.id
            ? { ...p, name: editName, price: editPrice }
            : p
        )
      );
    }
    setEditProduct(null);
  }

  const addProduct = async (e: FormEvent) => {
    e.preventDefault();
    const created: Product = await apiFetch(
      `/products/`,
      {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          price: newPrice,
          transaction: id,
        }),
      },
      token
    );
    setProducts((p) => [...p, created]);
    setNewName("");
    setNewPrice("");
  };

  return (
    <div className="flex flex-col h-full w-full p-6">
      {/* Edycja transakcji */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Data</label>
          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Całkowita kwota
          </label>
          <Input
            type="number"
            step="0.01"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Opis</label>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
      </div>
      <div className="flex">
        <Button onClick={saveTransaction} className="self-start mb-8 mr-4">
          Zapisz transakcję
        </Button>
        <Button
          variant="destructive"
          onClick={deleteTransaction}
          className="self-start mb-8"
        >
          Usuń transakcję
        </Button>
      </div>

      <Separator className="my-4" />

      {/* Produkty */}
      <h2 className="text-xl font-semibold mb-4">Produkty</h2>
      <div className="overflow-x-auto flex-1">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Nazwa</TableHead>
              <TableHead className="w-1/4 text-right">Cena</TableHead>
              <TableHead className="w-1/4">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell className="text-right">{p.price} PLN</TableCell>
                <TableCell>
                  <Dialog
                    open={Boolean(editProduct && editProduct.id === p.id)}
                    onOpenChange={(open) => {
                      if (!open) setEditProduct(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditProduct(p);
                          setEditName(p.name);
                          setEditPrice(p.price);
                        }}
                      >
                        Edytuj
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edytuj produkt</DialogTitle>
                        <DialogDescription>
                          Zmodyfikuj nazwę i cenę.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nazwa"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Cena"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => closeEditDialog()}
                        >
                          Anuluj
                        </Button>
                        <Button onClick={saveProduct}>Zapisz</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    className="ml-2"
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Usuń
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dodawanie nowego */}
      <form
        onSubmit={addProduct}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Input
          placeholder="Nazwa produktu"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="Cena"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
        />
        <Button type="submit">Dodaj produkt</Button>
      </form>
    </div>
  );
}
