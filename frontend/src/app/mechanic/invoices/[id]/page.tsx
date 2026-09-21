"use client";

import { useParams } from "next/navigation";
import { InvoiceDetailView } from "@/components/invoices/InvoiceDetailView";

export default function MechanicInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  return <InvoiceDetailView invoiceId={Number(params.id)} canVoid />;
}
