"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface ParsedItem {
  name: string;
  price: number;
  count: number;
  count_estimated: boolean;
}

interface ReceiptData {
  date: string;
  time: string | null;
  total: number;
  payment_method: string | null;
  items: ParsedItem[];
}

export default function ReceiptScanPage() {
  const { token } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = () => {
    const files = fileInputRef.current?.files;
    if (files && files[0]) {
      setPreview(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fileInputRef.current?.files?.length) {
      setError("Wybierz zdjęcie paragonu");
      return;
    }
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      // 1. Wyślij obraz do parsera
      // Używamy apiFetch do wysłania FormData (apiFetch obsługuje FormData bez Content-Type)
      const data: ReceiptData = await apiFetch(
        "/receipts/scan/",
        { method: "POST", body: formData },
        token
      );

      // 2. Utwórz transakcję
      const txPayload = {
        date: `${data.date} ${data.time ? data.time.slice(0, 5) : ""}`,
        total_amount: data.total,
        description: data.payment_method || "",
      };
      const tx = await apiFetch(
        "/transactions/",
        { method: "POST", body: JSON.stringify(txPayload) },
        token
      );
      const txId = tx.id;

      // 3. Utwórz produkty
      for (const item of data.items) {
        const prodPayload = {
          name: item.name,
          price: item.price.toString(),
          transaction: txId,
        };
        await apiFetch(
          "/products/",
          { method: "POST", body: JSON.stringify(prodPayload) },
          token
        );
      }

      // 4. Przekieruj do szczegółów
      router.push(`/transactions/${txId}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Wystąpił błąd");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Skanowanie paragonu</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Zrób zdjęcie paragonu
          </label>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        </div>
        {preview && (
          <Card className="max-w-xs">
            <CardContent>
              <Image
                src={preview}
                alt="Preview"
                width={400}
                height={300}
                className="w-full h-auto"
                style={{ objectFit: "contain" }}
              />
            </CardContent>
          </Card>
        )}
        {error && <p className="text-red-600">{error}</p>}
        <Button type="submit" disabled={uploading}>
          {uploading ? "Przetwarzanie..." : "Prześlij paragon"}
        </Button>
      </form>
      <Separator />
      <p className="text-sm text-gray-500">
        Użyj kamery telefonu, aby zeskanować paragon.
      </p>
    </div>
  );
}
