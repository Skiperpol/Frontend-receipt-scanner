import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

export type Transaction = {
  id: number;
  date: string;
  total_amount: string;
  description: string;
};

interface TransactionsTableProps {
  data: Transaction[];
}

export function TransactionsTable({ data }: TransactionsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const dt = new Date(row.getValue("date"));
          return (
            <div>
              {dt.toLocaleDateString()}{" "}
              <span className="text-sm text-muted-foreground">
                {dt.toLocaleTimeString()}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "total_amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kwota <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        ),
        accessorFn: (row) => parseFloat(row.total_amount),
        cell: ({ row }) => {
          const value = parseFloat(row.original.total_amount);
          return <div>{value.toFixed(2)} PLN</div>;
        },
        sortingFn: "basic",
      },
      {
        accessorKey: "description",
        header: "Opis",
        cell: ({ row }) => (
          <div className="truncate">{row.getValue("description") || "-"}</div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-full table-auto">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={
                    header.column.id === "date"
                      ? "w-50"
                      : header.column.id === "total_amount"
                      ? "w-32 text-right"
                      : ""
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-accent cursor-pointer"
                onClick={() => router.push(`/transactions/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      cell.column.id === "date"
                        ? "w-50"
                        : cell.column.id === "total_amount"
                        ? "w-32 text-right pr-5"
                        : ""
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Brak danych.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Poprzednia
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Następna
        </Button>
      </div>
    </div>
  );
}
