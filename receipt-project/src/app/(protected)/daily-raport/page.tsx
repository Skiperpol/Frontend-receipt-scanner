"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

type DailyData = Record<number, number>;
type MonthlyData = Record<number, number>;

export default function PnlCalendarPage() {
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const { token } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [dailyData, setDailyData] = useState<DailyData>({});
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});

  useEffect(() => {
    if (!token) return;
    if (view === "daily") {
      apiFetch(
        `/api/calendar/daily/?year=${year}&month=${month}`,
        {},
        token
      ).then((data: DailyData) => setDailyData(data));
    } else {
      apiFetch(`/api/calendar/monthly/?year=${year}`, {}, token).then(
        (data: MonthlyData) => setMonthlyData(data)
      );
    }
  }, [view, year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <div className="p-6">
      <Tabs
        value={view}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(v) => setView(v as any)}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="daily">Dzienne</TabsTrigger>
          <TabsTrigger value="monthly">Miesięczne</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Kontrolki wyboru czasu */}
      <div className="flex items-center space-x-4 mb-6">
        <Input
          type={view === "daily" ? "month" : "number"}
          value={
            view === "daily"
              ? `${year.toString().padStart(4, "0")}-${month
                  .toString()
                  .padStart(2, "0")}`
              : year
          }
          onChange={(e) => {
            if (view === "daily") {
              const [y, m] = e.currentTarget.value.split("-").map(Number);
              setYear(y);
              setMonth(m);
            } else {
              setYear(Number(e.currentTarget.value));
            }
          }}
        />
        <Button onClick={() => {}}>Odśwież</Button>
      </div>

      <Separator className="mb-6" />
      <div
        className={`grid gap-2 ${
          view === "daily" ? "grid-cols-7" : "grid-cols-4"
        }`}
      >
        {view === "daily"
          ? Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const val = dailyData[day] || 0;
              const bgClass =
                val > 0
                  ? "bg-green-600"
                  : val < 0
                  ? "bg-red-600"
                  : "bg-gray-400";
              const display = val === 0 ? "-" : `${val.toFixed(2)} PLN`;
              return (
                <Card
                  key={day}
                  className={`${bgClass} text-white p-2 rounded-lg`}
                >
                  <CardContent className="text-center">
                    <div className="font-medium">{day}</div>
                    <div className="text-sm">{display}</div>
                  </CardContent>
                </Card>
              );
            })
          : Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => {
              const val = monthlyData[m] || 0;
              const bgClass =
                val > 0
                  ? "bg-green-600"
                  : val < 0
                  ? "bg-red-600"
                  : "bg-gray-400";
              const display = val === 0 ? "-" : `${val.toFixed(2)} PLN`;
              return (
                <Card
                  key={m}
                  className={`${bgClass} text-white p-2 rounded-lg`}
                >
                  <CardContent className="text-center">
                    <div className="font-medium">{m}</div>
                    <div className="text-sm">{display}</div>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
