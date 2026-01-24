'use client'

import { useEffect, useState } from "react"
import { GenericDetailsModal } from "@/components/crud/GenericDetailsModal"
import { getInvoiceDetailsAction } from "@/lib/actions/invoices"
import { Badge } from "@/components/ui/badge"
import { getStatusStyles } from "@/lib/utils/features/getStatusStyles"
import { SALES_SUB_FEATURES } from "@/lib/configs/features/sales"
import { DocumentItemsList } from "./DocumentItemsList"

export function InvoiceDetailsModal({ invoiceId, isOpen, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && invoiceId) {
      setLoading(true)
      getInvoiceDetailsAction(invoiceId)
        .then(res => res.success && setData(res.data))
        .finally(() => setLoading(false))
    }
  }, [isOpen, invoiceId])

  return (
    <GenericDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${data?.invoice_number || ''}`}
      item={data}
      fields={SALES_SUB_FEATURES['invoices'].fields}
      isLoading={loading}
    >
      <div className="relative max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        <DocumentItemsList items={data?.invoice_items} title="Billed Items" />
      </div>
    </GenericDetailsModal>
  )
}