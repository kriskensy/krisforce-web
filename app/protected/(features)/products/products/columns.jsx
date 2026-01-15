'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "code", header: "Product Code" },
  { accessorKey: "name", header: "Product Name" },
  { accessorKey: "standard_price",  header: "Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("standard_price"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
    }
  },
  { accessorKey: "category_id", header: "Category",
    cell: ({ row }) => {
      const categoryName = row.original.product_categories?.name;
      return <span>{categoryName || "No category"}</span>
    }
  },
  { accessorKey: "deleted_at", header: "Record Status in DB",
    cell: ({ row }) => {
      const deletedAt = row.getValue("deleted_at");

      if(!deletedAt) {
        return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2py-1 text-xs font-medium text-green-700">
          Active
        </span>
        );
      }

      return (
        <span className="text-muted-foreground text-xs">
          Deactivated: {new Date(deletedAt).toLocaleDateString()}
        </span>
      )
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
        entityName="Product Category" 
      />
    )
  },
];