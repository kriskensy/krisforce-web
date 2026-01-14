'use client'

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { DeleteConfirmModal } from "@/components/crud/DeleteConfirmModal";

export default function MessagesList({ initialMessages }) {
  const supabase = getBrowserClient();
  const [messages, setMessages] = useState(initialMessages || []);
  const [deleteId, setDeleteId] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg)
      );
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleOpenDeleteModal = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== deleteId));
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
      console.error(error);
    } finally {
      setDeleteId(null); //close modal
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Replied': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (messages.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No messages found.</div>;
  }

  return (
    <>
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date</TableHead>
              <TableHead className="w-[200px]">Sender</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id}>
                <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(msg.created_at).toLocaleString()}
                </TableCell>
                
                <TableCell>
                  <div className="font-semibold">{msg.sender_name}</div>
                  <div className="text-xs text-muted-foreground break-all">{msg.sender_email}</div>
                </TableCell>
                
                <TableCell>
                  <div className="font-medium text-sm">{msg.subject}</div>
                  <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap max-w-md line-clamp-3 hover:line-clamp-none transition-all">
                    {msg.message_text}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Select 
                    defaultValue={msg.status} 
                    onValueChange={(val) => handleStatusChange(msg.id, val)}
                  >
                    <SelectTrigger className={`h-8 w-[130px] border-none ${getStatusColor(msg.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Replied">Replied</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleOpenDeleteModal(msg.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmModal 
        open={!!deleteId} 
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={confirmDelete} 
        resourceName="message" 
      />
    </>
  );
}