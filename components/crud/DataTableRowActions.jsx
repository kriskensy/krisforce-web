'use client';

import { MessageSquare, MoreHorizontal, Eye, Pencil, Trash2, RotateCcw, EditIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

export function DataTableRowActions({ 
  row, 
  userLevel,
  onView,
  onEdit, 
  onAddComment,
  onDelete,
  onReactivate,
  onCreateInvoice,
  entityName = "record",
  editIcon: EditIcon = Pencil, //default = Pencil
  editLabel
}) {
  const item = row.original;
  
  const hasDeletedAtField = 'deleted_at' in item;
  const hasActiveField = 'active' in item;
  const supportsToggle = hasDeletedAtField || hasActiveField;

  const isDeactivated = 
    (hasDeletedAtField && item.deleted_at) || 
    (hasActiveField && item.active === false);

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
        
        {/* all users */}
        {onView && (
          <DropdownMenuItem onClick={() => onView(item)}>
            <Eye className="mr-2 h-4 w-4" /> Details
          </DropdownMenuItem>
        )}

        {entityName === "Order" && userLevel >= 2 && onCreateInvoice && !isDeactivated && (
          <DropdownMenuItem onClick={() => onCreateInvoice(item)}>
            <FileText className="mr-2 h-4 w-4"/> Create Invoice
          </DropdownMenuItem>
        )}

        {/* all users */}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <EditIcon className="mr-2 h-4 w-4" /> {label}
          </DropdownMenuItem>
        )}

        {onAddComment && (
          <DropdownMenuItem onClick={() => onAddComment(item)}>
            <MessageSquare className="mr-2 h-4 w-4" /> Add Comment
          </DropdownMenuItem>
        )}

        {/* manager+ actions */}
        {userLevel >= 2 && (
          <>
            <DropdownMenuSeparator />

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