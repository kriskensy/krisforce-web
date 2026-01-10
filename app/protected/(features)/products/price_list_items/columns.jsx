'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "product_id", header: "Product",
    cell: ({ row }) => {
      const productName = row.original.products?.name;
      return <span>{productName || "No product"}</span>;
    }
  },
  { accessorKey: "price", header: "Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
    }
  },
  { accessorKey: "price_list_id", header: "Price List",
    cell: ({ row }) => {
      const priceListName = row.original.price_lists?.name;
      return <span>{priceListName || "No price list"}</span>;
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
        entityName="Price List Item" 
      />
    )
  },
];
