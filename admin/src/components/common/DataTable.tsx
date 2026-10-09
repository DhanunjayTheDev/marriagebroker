import React from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TableSkeleton } from '../ui';
import type { Pagination } from '../../types';

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  isLoading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns, data, isLoading, pagination, onPageChange, onRowClick, emptyMessage = 'No records found',
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/40">
                {hg.headers.map((header) => (
                  <th key={header.id} className="text-left font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap">
                    {header.isPlaceholder ? null : (
                      <button
                        className={cn('flex items-center gap-1', header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground')}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: <ChevronUp className="w-3.5 h-3.5" />, desc: <ChevronDown className="w-3.5 h-3.5" /> }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length} className="p-4"><TableSkeleton cols={columns.length} /></td></tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn('data-table-row', onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="p-1.5 rounded-md border border-border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm px-3">Page {pagination.page} / {pagination.totalPages}</span>
            <button
              disabled={!pagination.hasNext}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="p-1.5 rounded-md border border-border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
