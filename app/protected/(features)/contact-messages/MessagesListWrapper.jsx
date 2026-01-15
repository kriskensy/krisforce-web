'use client';

import { useState } from 'react';
import { getBrowserClient } from "@/lib/supabase/client";
import { GLOBAL_COLUMNS_REGISTRY } from "@/lib/configs/columns-registry";
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmModal } from "@/components/crud/DeleteConfirmModal";
import { GenericDetailsModal } from "@/components/crud/GenericDetailsModal";
import { toast } from "sonner";
import { DisplayActiveOnlyRecordsCheckbox } from '@/components/crud/DisplayActiveOnlyRecordsCheckbox';

export default function MessagesList({ initialMessages, userLevel, tableKey }) {
  const supabase = getBrowserClient();
  const [messages, setMessages] = useState(initialMessages || []);
  const [viewItem, setViewItem] = useState(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [itemToDeactivate, setItemToDeactivate] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const filteredMessages = messages.filter((message) => {
    if(showActiveOnly) {
      return !message.deleted_at;
    }
    return true;
  });

  const handleView = (item) => setViewItem(item);

  //email respond
  const handleRespond = async (item) => {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: 'Responded', responded_at: now })
        .eq("id", item.id);

      if (error) throw error;

      setMessages(prev => prev.map(message => 
        message.id === item.id ? { ...message, status: 'Responded', responded_at: now } : message
      ));

      toast.success("Message status updated");
      
      //mail to with native email client: just opening new email message
      const subject = encodeURIComponent(`Re: ${item.subject}`);
      window.location.href = `mailto:${item.sender_email}?subject=${subject}`;
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeactivateRequest = (itemOrId) => {
    const id = typeof itemOrId === 'object' ? itemOrId.id : itemOrId;
    setItemToDeactivate(id);
    setIsDeactivateModalOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!itemToDeactivate) return;
    
    const now = new Date().toISOString();

    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ deleted_at: now }) //object, column value
        .eq("id", itemToDeactivate);

      if (error) throw error;

      //update local state
      setMessages(prev => prev.map(message => 
        message.id === itemToDeactivate ? { ...message, deleted_at: now } : message
      ));

      toast.success("Message deactivated successfully");
    } catch (error) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsDeactivateModalOpen(false);
      setItemToDeactivate(null);
    }
  };

  const handleReactivate = async (id) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ deleted_at: null })
        .eq("id", id);

      if (error) throw error;

      //update local state
      setMessages(prev => prev.map(message => 
        message.id === id ? { ...message, deleted_at: null } : message
      ));

      toast.success("Message reactivated successfully");
    } catch (error) {
      toast.error("Error", { description: error.message });
    }
  };

  const getColumnsFunc = GLOBAL_COLUMNS_REGISTRY[tableKey];
  if (!getColumnsFunc) return <div>Registry error: {tableKey}</div>;

  const columns = getColumnsFunc(
    userLevel, 
    handleView, 
    handleRespond, 
    handleDeactivateRequest,
    handleReactivate
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DisplayActiveOnlyRecordsCheckbox
          tableKey={tableKey}
          showActiveOnly={showActiveOnly}
          onActiveChange={setShowActiveOnly}
        />
      </div>
      <div className="rounded-md border bg-card">
        <DataTable
          columns={columns}
          data={filteredMessages}
        />
      </div>

      <GenericDetailsModal 
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        item={viewItem}
        title="Message Details"
        fields={[
          { name: 'created_at', label: 'Received' },
          { name: 'sender_name', label: 'Sender' },
          { name: 'sender_email', label: 'Email' },
          { name: 'subject', label: 'Subject' },
          { name: 'status', label: 'Status' },
          { name: 'responded_at', label: 'Responded At' },
          { name: 'message_text', label: 'Message' },
        ]}
      />

      <DeleteConfirmModal 
        open={isDeactivateModalOpen}
        onOpenChange={setIsDeactivateModalOpen}
        onConfirm={confirmDeactivate}
        resourceName="Contact Message"
      />
    </div>
  );
}