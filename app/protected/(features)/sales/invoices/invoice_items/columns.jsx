'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "description", header: "Description" },
  { accessorKey: "product_id", header: "Product",
    cell: ({ row }) => {
      const productName = row.original.products?.name;
      return <span>{productName || "No product"}</span>;
    }
  },
  { accessorKey: "quantity", header: "Quantity" },
  { accessorKey: "unit_price", header: "Unit Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("unit_price"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
    }
  },
  { accessorKey: "total_price", header: "Total Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_price"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
    }
  },
  { accessorKey: "invoice_id", header: "Invoice",
    cell: ({ row }) => {
      const invoiceNumber = row.original.invoices?.invoice_number;
      return <span>{invoiceNumber || "No invoice"}</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        userLevel={userLevel} 
        onEdit={onEdit} 
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Invoice Item" 
      />
    )
  },
];
