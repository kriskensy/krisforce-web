'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { recordPaymentAction } from "@/lib/actions/invoices";

export function RecordPaymentModal({ isOpen, onClose, invoice, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (invoice) {
      const remaining = invoice.total_amount - (invoice.paid_amount || 0);
      setAmount(remaining.toFixed(2));
    }
  }, [invoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);

    if (isNaN(val) || val <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setIsPending(true);
    try {
      const result = await recordPaymentAction(invoice.id, val);
      if (result.success) {
        toast.success(`Payment of ${val} recorded`);
        onSuccess();
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Critical error", { description: error.message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment: {invoice?.invoice_number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount to pay</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              Total: {invoice?.total_amount} | Paid: {invoice?.paid_amount || 0}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}