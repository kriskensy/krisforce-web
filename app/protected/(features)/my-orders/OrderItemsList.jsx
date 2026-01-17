'use client';

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export default function OrderItemsList({ orderId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = getBrowserClient();

  useEffect(() => {
    if (!orderId) return;
    const fetchItems = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('order_items')
        .select('quantity, unit_price, total_price, products(name)')
        .eq('order_id', orderId);
      setItems(data || []);
      setLoading(false);
    };
    fetchItems();
  }, [orderId, supabase]);

  if (loading) return <p className="text-sm text-muted-foreground italic">Loading items...</p>;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No items found for this order.</p>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 text-primary uppercase tracking-wider">Order Items</h3>
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-center">Quantity</th>
              <th className="p-3 text-right">Unit Price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-medium">{item.products?.name}</td>
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