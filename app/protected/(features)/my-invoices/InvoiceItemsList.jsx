'use client';

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export default function InvoiceItemsList({ invoiceId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = getBrowserClient();

  useEffect(() => {
    if (!invoiceId) return;
    const fetchItems = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('invoice_items')
        .select('description, quantity, unit_price, total_price, products(name)')
        .eq('invoice_id', invoiceId);
      setItems(data || []);
      setLoading(false);
    };
    fetchItems();
  }, [invoiceId, supabase]);

  if (loading) return <p className="text-sm text-muted-foreground italic">Loading items...</p>;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No items found for this invoice.</p>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 text-primary uppercase tracking-wider">Invoice Items</h3>
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-center">Quantity</th>
              <th className="p-3 text-right">Unit Price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-medium">{item.products?.name}</td>
                <td className="p-3 font-medium">{item.description}</td>
                <td className="p-3 text-center">{item.quantity}</td>
                <td className="p-3 text-right">
                  {parseFloat(item.unit_price).toFixed(2)} €
                </td>
                <td className="p-3 text-right font-bold text-primary">
                  {parseFloat(item.total_price).toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}