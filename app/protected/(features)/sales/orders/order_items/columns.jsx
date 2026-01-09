'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "order_id", header: "Order",
    cell: ({ row }) => {
      const orderNumber = row.original.orders?.order_number;
      return <span>{orderNumber || "No order"}</span>;
    }
  },
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
        entityName="Order Item" 
      />
    )
  },
];
