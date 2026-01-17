"use client";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusStyles } from "@/lib/utils/features/getStatusStyles";

export const getMyOrdersColumns = (userLevel, onView, onEdit, onDelete, onReactivate) => [
  { accessorKey: "order_number", header: "Order Number" },
  { accessorKey: "order_date", header: "Order Date",
    cell: ({ row }) => {
      const orderDate = row.getValue("order_date");
      return <span>{new Date(orderDate).toLocaleDateString()}</span>;
    }
  },
  {
    accessorKey: "status_name",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status_name");
      return (
        <span className={cn("px-2.5 py-0.5 rounded-md border shadow-none font-semibold text-[11px] uppercase tracking-wider", getStatusStyles(status, 'order'))}>
          {status || "Unknown"}
        </span>
      );
    }
  },
  { accessorKey: "total_amount", header: "Total Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onView(row.original)}
      >
        <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> 
        <span className="font-medium">View Details</span>
      </Button>
    ),
  },
];