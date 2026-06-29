import { ReactNode } from 'react';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: ReactNode;
  rowKey?: (row: T, index: number) => string;
  rowClassName?: (row: T, index: number) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyState,
  rowKey,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 font-medium text-xs uppercase tracking-wide text-neutral-400 ${c.className ?? ''}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-neutral-100">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8">
                {emptyState ?? (
                  <p className="text-center text-sm text-neutral-400">No records found.</p>
                )}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={rowKey ? rowKey(row, i) : i}
                className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${rowClassName ? rowClassName(row, i) : ''}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 text-neutral-700 ${c.className ?? ''}`}>
                    {c.render ? c.render(row) : (row as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
