'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getPaymentMethodsAction, recordPaymentAction } from "@/lib/actions/invoices";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RecordPaymentModal({ isOpen, onClose, invoice, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);

  //get payment methods on modal open
  useEffect(() => {
    async function loadMethods() {
      const result = await getPaymentMethodsAction();

      if(result.success) {
        setPaymentMethods(result.data);

        //set default method: first in array
        if(result.data.length > 0)
          setPaymentMethodId(result.data[0].id);
      }
    }
    if (isOpen) loadMethods();
  }), [isOpen];

  //set amount to pay
  useEffect(() => {
    if (invoice) {
      const remaining = invoice.total_amount - (invoice.paid_amount || 0);
      setAmount(remaining.toFixed(2));
    }
  }, [invoice]);

  const handleSubmit = async (event) => {
    event.preventDefault();
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
            />
          </div>

          <div className="grid gap-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
              <SelectTrigger>
                <SelectValue placeholder="Select method..." />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((paymentMethod) => (
                  <SelectItem key={paymentMethod.id} value={paymentMethod.id}>
                    {paymentMethod.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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