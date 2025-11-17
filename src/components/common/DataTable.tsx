"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  widthClass?: string;
  isHeader?: boolean; // keep parity with UI TableCell API
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey?: keyof T | ((row: T, index: number) => React.Key);
  loading?: boolean;
  emptyText?: string;
  headerClassName?: string;
  bodyClassName?: string;
  minWidthClass?: string; // e.g. "min-w-[1102px]"
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
};

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey = "id",
  loading,
  emptyText = "No data",
  headerClassName,
  bodyClassName,
  minWidthClass = "min-w-[1102px]",
  currentPage = 1,
  totalPages = 1,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  showPagination = false,
}: DataTableProps<T>) {
  const getRowKey = (row: T, index: number): React.Key => {
    if (typeof rowKey === "function") return rowKey(row, index);
    return (row[rowKey as keyof T] as unknown as React.Key) ?? index;
  };

  // Calculate pagination info
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const total = totalItems ?? data.length;
  const startItem = total > 0 ? indexOfFirstItem + 1 : 0;
  const endItem = Math.min(indexOfLastItem, total);

  // Pagination handlers
  const goToNextPage = () => {
    if (onPageChange && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (onPageChange && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className={minWidthClass}>
          <Table>
            <TableHeader className={`border-b border-gray-100 dark:border-white/[0.05] ${headerClassName || ""}`}>
              <TableRow>
                {columns.map((col, idx) => (
                  <TableCell
                    key={String(col.key) + idx}
                    isHeader
                    className={`px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300 ${col.widthClass || ""} ${col.headerClassName || ""}`}
                  >
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className={`divide-y divide-gray-100 dark:divide-white/[0.05] ${bodyClassName || ""}`}>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {columns.map((col, j) => (
                      <TableCell key={`s-${i}-${j}`} className="px-6 py-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">
                    {emptyText}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIdx) => (
                  <TableRow 
                    key={getRowKey(row, rowIdx)}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {columns.map((col, colIdx) => (
                      <TableCell key={`${String(col.key)}-${colIdx}`} className={`px-6 py-4 ${col.className || ""}`}>
                        {col.render ? col.render(row, rowIdx) : String(row[col.key as keyof T] ?? "-")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.05] gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span>{" "}
            of <span className="font-medium">{total}</span> results
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 1
                  ? "bg-blue-100/50 text-blue-300 cursor-not-allowed dark:bg-blue-900/20 dark:text-blue-700"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40"
              }`}
            >
              Previous
            </button>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                  : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


