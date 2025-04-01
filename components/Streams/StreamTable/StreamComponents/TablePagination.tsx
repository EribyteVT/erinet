"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  table: any;
  totalRows: number;
  selectedRows: number;
}

export const TablePagination: React.FC<PaginationProps> = ({
  table,
  totalRows,
  selectedRows,
}) => (
  <div className="flex items-center justify-between">
    <div>
      {selectedRows} of {totalRows} row(s) selected
    </div>
    <div className="flex gap-2">
      <Button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft />
      </Button>
      <Button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="h-8 w-8 p-0"
      >
        <ChevronRight />
      </Button>
    </div>
  </div>
);

export default TablePagination;
