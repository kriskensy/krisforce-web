'use client';

import { MoreHorizontal, Pencil, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

export const getColumns = (userLevel, onEdit, onDelete) => [
  { accessorKey: "code", header: "Code" },
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
  { accessorKey: "deleted_at", header: "Deactivated?",
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
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            {/* user actions */}
            {userLevel === 1 && (
              <DropdownMenuItem onClick={() => console.log("Added to cart", product.id)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </DropdownMenuItem>
            )}
            
            {/* manager+ actions */}
            {userLevel >= 2 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(product.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];