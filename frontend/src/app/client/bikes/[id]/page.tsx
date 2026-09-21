"use client";

import { useParams } from "next/navigation";
import { BikeHistoryView } from "@/components/bikes/BikeHistoryView";

export default function ClientBikeDetailPage() {
  const params = useParams<{ id: string }>();
  return <BikeHistoryView bikeId={Number(params.id)} />;
}
