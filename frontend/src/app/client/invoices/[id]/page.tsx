"use client";

import { useParams } from "next/navigation";
import { InvoiceDetailView } from "@/components/invoices/InvoiceDetailView";

export default function ClientInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  return <InvoiceDetailView invoiceId={Number(params.id)} />;
}
