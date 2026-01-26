'use client';

import { GLOBAL_COLUMNS_REGISTRY } from "@/lib/configs/columns-registry";
import { useState } from 'react';
import { DataTableServer } from '@/components/ui/data-table-server';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DynamicFormModal from '@/components/crud/DynamicFormModal';
import { DeleteConfirmModal } from "@/components/crud/DeleteConfirmModal";
import { DisplayActiveOnlyRecordsCheckbox }from "@/components/crud/DisplayActiveOnlyRecordsCheckbox";
import { GenericDetailsModal } from "./GenericDetailsModal";
import { toast } from "sonner";
import TicketDetailsModal from "@/components/tickets/TicketDetailsModal";
import { OrderDetailsModal } from "../sales/OrderDetailsModal";
import { InvoiceDetailsModal } from "../sales/InvoiceDetailsModal";
import { DetailsModalRegistry } from "./DetailsModalRegistry";
import AddCommentModal from "../tickets/AddCommentModal";
import { createInvoiceFromOrderAction } from "@/lib/actions/invoices";

export default function ItemsTableWrapper({ subcategory, userLevel, apiEndpoint, fields, title, description, tableKey, renderExtra, hideAddButton = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [viewItem, setViewItem]= useState(null);
  const [replyTicketId, setReplyTicketId] = useState(null)

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    setViewItem(item);
  }

  const handleDeleteRequest = (item) => {
    const id = typeof item === 'object' ? item.id : item;

    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`${apiEndpoint}/${itemToDelete}`, { method: 'DELETE' });

      if (!response.ok)
        throw new Error("Failed to delete");
      
      toast.success("Deleted successfully");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleReactivate = async (id) => {
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, { 
        method: 'PATCH'
      });

      if (!response.ok) throw new Error("Failed to reactivate");

      toast.success("Record reactivated successfully");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Error", { description: error.message });
    }
  };

  const handleAddComment = (item) => {
    setReplyTicketId(item.id);
  };

  const handleCreateInvoice = async (order) => {
    try{
      const result = await createInvoiceFromOrderAction(order.id);

      if(result.success) {
        toast.success(`Invoice created for ${order.order_number}`);
        setRefreshKey(prev => prev + 1 );
        return;
      }

      if(result.code === 'ALREADY_EXISTS') {
        toast.info(`Order ${order.order_number} already has an invoice: ${result.invoiceNumber}`)
        return;
      }

      toast.error(result.error || "Failed to create invoice");

    } catch (error) {
      toast.error("Handle creation invoice from order Error", { description: error.message });
    }
  }

  const getColumnsFunc = GLOBAL_COLUMNS_REGISTRY[tableKey];

  if (!getColumnsFunc) {
    console.error(`Registry error: No columns for key "${tableKey}"`);
    return (
      <div className="p-4 border border-destructive text-destructive">
        Table configuration error: No columns found for <b>{tableKey}</b>.
      </div>
    );
  }

  const columns = getColumnsFunc(userLevel, handleView, handleCreateInvoice, handleEdit, handleDeleteRequest, handleReactivate, handleAddComment);

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-4">

        {userLevel >= 1 && (
          <DisplayActiveOnlyRecordsCheckbox 
          tableKey={tableKey}
          showActiveOnly={showActiveOnly}
          onActiveChange={setShowActiveOnly}
        />
        )}        
        
        {/* manager+*/}
        {!hideAddButton && userLevel >= 2 && (
          <Button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        )}
      </div>

      <DataTableServer 
        key={`${subcategory}-${refreshKey}`}
        columns={columns}
        endpoint={apiEndpoint}
        userLevel={userLevel}
        activeOnly={showActiveOnly}
      />

      <DetailsModalRegistry
        tableKey={tableKey}
        viewItem={viewItem}
        onClose={() => setViewItem(null)}
        userLevel={userLevel}
        fields={fields}
        title={title}
        renderExtra={renderExtra}
      />

      <DynamicFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false);
          setRefreshKey(prev => prev + 1);
        }}
        initialData={selectedItem}
        fields={fields} 
        endpoint={apiEndpoint}
        resourceName={title}
      />

      <DeleteConfirmModal 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        resourceName={title}
      />

      <AddCommentModal 
        ticketId={replyTicketId} 
        isOpen={!!replyTicketId} 
        onClose={() => setReplyTicketId(null)} 
      />
    </div>
  );
}