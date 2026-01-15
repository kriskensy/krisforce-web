'use client';

import { MoreHorizontal, Eye, Pencil, Trash2, ShoppingCart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

export function DataTableRowActions({ 
  row, 
  userLevel,
  onView,
  onEdit, 
  onDelete,
  onReactivate,
  entityName = "record",
  editIcon,
  editLabel
}) {
  const item = row.original;
  
  const hasDeletedAtField = 'deleted_at' in item;
  const hasActiveField = 'active' in item;
  const supportsToggle = hasDeletedAtField || hasActiveField;

  const isDeactivated = 
    (hasDeletedAtField && item.deleted_at) || 
    (hasActiveField && item.active === false);

  const EditIcon = editIcon || Pencil;
  const label = editLabel || `Edit ${entityName}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {/* user / client action */}
        {userLevel === 1 && (
          <DropdownMenuItem onClick={() => console.log("Added to cart", item.id)}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </DropdownMenuItem>
        )}
        
        {/* all users */}
        {onView && (
          <DropdownMenuItem onClick={() => onView(item)}>
            <Eye className="mr-2 h-4 w-4" /> Details
          </DropdownMenuItem>
        )}

        {/* manager+ actions */}
        {userLevel >= 2 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <EditIcon className="mr-2 h-4 w-4"/>
              {label}
            </DropdownMenuItem>

            {supportsToggle ? (
              isDeactivated ? (
                <DropdownMenuItem 
                  onClick={() => onReactivate(item.id)}
                  className="text-green-600 focus:text-green-600 focus:bg-green-50"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => onDelete(item.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                </DropdownMenuItem>
              )
            ) : (
              <DropdownMenuItem 
                onClick={() => onDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}