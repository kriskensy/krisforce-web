'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "invoice_id", header: "Invoice",
    cell: ({ row }) => {
      const invoiceNumber = row.original.invoices?.invoice_number;
      return <span>{invoiceNumber || "No invoice"}</span>;
    }
  },
  { accessorKey: "payment_date", header: "Payment Date",
    cell: ({ row }) => {
      const paymentDate = row.getValue("payment_date");
      return <span>{new Date(paymentDate).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "payment_method_id", header: "Payment Method",
    cell: ({ row }) => {
      const methodName = row.original.payment_methods?.name;
      return <span>{methodName || "No method"}</span>;
    }
  },
  { accessorKey: "amount", header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
    }
  },
  { accessorKey: "deleted_at", header: "Record Status in DB",
    cell: ({ row }) => {
      const deletedAt = row.getValue("deleted_at");

      if(!deletedAt) {
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            Active
          </span>
        );
      }

      return (
        <span className="text-muted-foreground text-xs">
          Deactivated: {new Date(deletedAt).toLocaleDateString()}
        </span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        userLevel={userLevel} 
        onView={onView}
        onEdit={onEdit} 
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Payment" 
      />
    )
  },
];
