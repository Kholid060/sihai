import type { AnyColumn, SQL } from 'drizzle-orm';
import { getTableColumns, gt, lt, sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

export const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T['_']['columns'],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column].name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

export function incrementDBColumn(column: AnyColumn, value = 1) {
  return sql`${column} + ${value}`;
}

export function compareColumn(left: AnyColumn, right: unknown, asc: boolean) {
  return asc ? gt(left, right) : lt(left, right);
}
