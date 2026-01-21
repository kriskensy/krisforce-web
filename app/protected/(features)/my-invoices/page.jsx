'use client';

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import ItemsTableWrapper from "@/components/crud/ItemsTableWrapper";
import InvoiceItemsList from "./InvoiceItemsList";

//gets data from a view report_invoices
export default function MyInvoicesPage() {
  const [clientId, setClientId] = useState(null);
  const supabase = getBrowserClient();

  const modalFields = [
    { name: "invoice_number", label: "Invoice Number" },
    { name: "invoice_date", label: "Invoice Date", type: "date" },
    { name: "due_date", label: "Due Date", type: "date" },
    { name: "total_amount", label: "Total Amount", isCurrency: true },
    { name: "paid_amount", label: "Paid Amount", isCurrency: true },
    { name: "amount_to_pay", label: "Amount to Pay", isCurrency: true },
    { name: "status_name", label: "Status" }
  ];

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("client_id")
          .eq("id", user.id)
          .single();
        setClientId(data?.client_id);
      }
    }
    getUserData();
  }, [supabase]);

  if (!clientId) return <div>Loading access data...</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight">My Invoices</h2>
      <ItemsTableWrapper 
        tableKey="my-invoices"
        apiEndpoint={`/api/invoices?client_id=${clientId}`}
        fields={modalFields}
        userLevel={0} //only client
        renderExtra={(item) => <InvoiceItemsList invoiceId={item.id} />} //products list
      />
    </div>
  );
}