import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function RecordTable<T extends { id: string }>({
  rows,
  columns,
  emptyTitle,
  emptyHint,
}: {
  rows: T[];
  columns: Column<T>[];
  emptyTitle: string;
  emptyHint: string;
}) {
  if (rows.length === 0) {
    return (
      <Card className="border-dashed p-10 text-center">
        <p className="font-display text-base font-semibold">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{emptyHint}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.render(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
