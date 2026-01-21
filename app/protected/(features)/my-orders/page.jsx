'use client';

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import ItemsTableWrapper from "@/components/crud/ItemsTableWrapper";
import OrderItemsList from "./OrderItemsList";

//gets data from a view report_orders
export default function MyOrdersPage() {
  const [clientId, setClientId] = useState(null);
  const supabase = getBrowserClient();

  const modalFields = [
    { name: "order_number", label: "Order Number" },
    { name: "order_date", label: "Order Date", type: "date" },
    { name: "total_amount", label: "Total Amount", isCurrency: true },
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
      <h2 className="text-3xl font-bold tracking-tight">My Orders</h2>
      <ItemsTableWrapper 
        tableKey="my-orders"
        apiEndpoint={`/api/orders?client_id=${clientId}`}
        fields={modalFields}
        userLevel={0} //only client
        renderExtra={(item) => <OrderItemsList orderId={item.id} />} //products list
      />
    </div>
  );
}