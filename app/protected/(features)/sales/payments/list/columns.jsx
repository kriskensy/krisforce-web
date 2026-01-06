'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "invoice_id", header: "Invoice",
    cell: ({ row }) => {
      const invoiceNumber = row.original.invoices?.invoice_number;
      return <span>{invoiceNumber || "No invoice"}</span>;
    }
  },
  { accessorKey: "payment_method_id", header: "Payment Method",
    cell: ({ row }) => {
      const methodName = row.original.payment_methods?.name;
      return <span>{methodName || "No method"}</span>;
    }
  },
  { accessorKey: "payment_date", header: "Payment Date",
    cell: ({ row }) => {
      const paymentDate = row.getValue("payment_date");
      return <span>{new Date(paymentDate).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "amount", header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
    }
  },
  { accessorKey: "reference_number", header: "Reference Number" },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        userLevel={userLevel} 
        onEdit={onEdit} 
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Payment" 
      />
    )
  },
];
