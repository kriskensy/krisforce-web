"use client";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusStyles } from "@/lib/utils/features/getStatusStyles";

export const getMyInvoicesColumns = (userLevel, onView, onEdit, onDelete, onReactivate) => [
  { accessorKey: "invoice_number", header: "Invoice Number" },
  { accessorKey: "invoice_date", header: "Invoice Date",
    cell: ({ row }) => {
      const invoiceDate = row.getValue("invoice_date");
      return <span>{new Date(invoiceDate).toLocaleDateString()}</span>;
    }
  },
  {
    accessorKey: "status_name",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status_name");
      return (
        <span className={cn("px-2.5 py-0.5 rounded-md border shadow-none font-semibold text-[11px] uppercase tracking-wider", getStatusStyles(status, 'invoice'))}>
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
  { accessorKey: "paid_amount", header: "Paid Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("paid_amount"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
    }
  },
  { accessorKey: "amount_to_pay", header: "Amount to pay",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount_to_pay"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
    }
  },
  { accessorKey: "due_date", header: "Due Date",
    cell: ({ row }) => {
      const invoiceDate = row.getValue("due_date");
      return <span>{new Date(invoiceDate).toLocaleDateString()}</span>;
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