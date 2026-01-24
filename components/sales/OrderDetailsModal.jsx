'use client'

import { useEffect, useState } from "react"
import { GenericDetailsModal } from "@/components/crud/GenericDetailsModal"
import { getOrderDetailsAction } from "@/lib/actions/orders"
import { Badge } from "@/components/ui/badge"
import { getStatusStyles } from "@/lib/utils/features/getStatusStyles"
import { SALES_SUB_FEATURES } from "@/lib/configs/features/sales"
import { DocumentItemsList } from "./DocumentItemsList"

export function OrderDetailsModal({ orderId, isOpen, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true)
      getOrderDetailsAction(orderId)
        .then(res => res.success && setData(res.data))
        .finally(() => setLoading(false))
    }
  }, [isOpen, orderId])

  return (
    <GenericDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${data?.order_number || ''}`}
      item={data}
      fields={SALES_SUB_FEATURES['orders'].fields}
      isLoading={loading}
    >
      <div className="relative max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        <DocumentItemsList items={data?.order_items} title="Ordered Products" />
      </div>
    </GenericDetailsModal>
  )
}