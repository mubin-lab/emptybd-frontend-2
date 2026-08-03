"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  // Filtering
  filters?: FilterOption[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  // Sorting
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string, direction: "asc" | "desc") => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  totalRecords?: number;
  // Empty message
  emptyMessage?: string;
}

export default function AdminTable<T>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Search records...",
  searchValue = "",
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  sortColumn,
  sortDirection,
  onSort,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  totalRecords = 0,
  emptyMessage = "No records found.",
}: AdminTableProps<T>) {
  const handleSortClick = (columnKey: string) => {
    if (!onSort) return;
    let nextDir: "asc" | "desc" = "asc";
    if (sortColumn === columnKey) {
      nextDir = sortDirection === "asc" ? "desc" : "asc";
    }
    onSort(columnKey, nextDir);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-gray-900 border-gray-700 text-white rounded-md placeholder-gray-500 focus:border-primary w-full h-10 text-sm"
            />
          </div>
        )}

        {/* Filters */}
        {filters.length > 0 && onFilterChange && (
          <div className="flex flex-wrap gap-2 items-center">
            <SlidersHorizontal className="text-gray-500 h-4 w-4 mr-1 hidden md:block" />
            {filters.map((filter) => (
              <div key={filter.key} className="relative">
                <select
                  value={activeFilters[filter.key] || ""}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-1.5 text-xs lg:text-sm font-medium focus:outline-none focus:border-primary pr-8 appearance-none cursor-pointer h-10"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid Container */}
      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden shadow-lg">
        <Table className="min-w-full divide-y divide-gray-800">
          <TableHeader className="bg-gray-900/80 border-b border-gray-800">
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                return (
                  <TableHead
                    key={col.key.toString()}
                    onClick={() => col.sortable && handleSortClick(col.key.toString())}
                    className={`text-gray-300 font-semibold font-parkinsans py-3.5 px-4 text-sm ${
                      col.sortable ? "cursor-pointer select-none hover:text-white" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {col.sortable && onSort && (
                        <span>
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-primary" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-900 bg-gray-950">
            {isLoading ? (
              // Loading state skeletons
              Array.from({ length: pageSize }).map((_, rIdx) => (
                <TableRow key={rIdx} className="hover:bg-transparent">
                  {columns.map((col) => (
                    <TableCell key={col.key.toString()} className="py-4 px-4">
                      <Skeleton className="h-4 bg-gray-800 rounded w-4/5 animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-gray-500 font-parkinsans"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              data.map((row, rIdx) => (
                <TableRow
                  key={rIdx}
                  className="hover:bg-gray-900/40 border-b border-gray-900 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key.toString()}
                      className="py-3.5 px-4 text-gray-300 text-sm font-parkinsans"
                    >
                      {col.render ? col.render(row) : (row[col.key as keyof T] as any)?.toString() || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && data.length > 0 && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400 font-parkinsans">
          <div>
            Showing <span className="text-white font-medium">{Math.min(data.length, pageSize)}</span> records.{" "}
            {totalRecords > 0 && (
              <>
                Total: <span className="text-white font-medium">{totalRecords}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="border-gray-700 text-gray-300 hover:bg-gray-900 text-xs px-2.5 h-8"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              // Limit rendering of page numbers for high counts
              if (
                totalPages > 6 &&
                pageNum !== 1 &&
                pageNum !== totalPages &&
                Math.abs(pageNum - currentPage) > 1
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return <span key={pageNum} className="px-1 text-gray-600">...</span>;
                }
                return null;
              }
              return (
                <Button
                  key={pageNum}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={`h-8 w-8 text-xs p-0 ${
                    isCurrent
                      ? "bg-primary text-white hover:bg-primary/95"
                      : "border-gray-700 text-gray-300 hover:bg-gray-900"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="border-gray-700 text-gray-300 hover:bg-gray-900 text-xs px-2.5 h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
