export interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  bikeCount: number;
  createdAt: string;
}

export interface Bike {
  id: number;
  clientId: number;
  clientName: string;
  registrationNumber: string;
  brand: string;
  model: string;
  variant?: string | null;
  manufacturingYear?: number | null;
  colour?: string | null;
  currentOdometer: number;
  purchaseDate?: string | null;
  photoUrl?: string | null;
  notes?: string | null;
  lastServiceDate?: string | null;
  createdAt: string;
}

export type ServiceStatus = "New" | "InProgress" | "Completed";

export interface BikeHistoryPart {
  partName: string;
  action: string;
  oldPartDescription?: string | null;
  newPartDescription?: string | null;
}

export interface BikeHistoryItem {
  serviceId: number;
  serviceDate: string;
  odometer: number;
  complaint?: string | null;
  workPerformed?: string | null;
  status: ServiceStatus;
  labourAmount: number;
  parts: BikeHistoryPart[];
  invoiceId?: number | null;
  invoiceNumber?: string | null;
  invoiceTotal?: number | null;
}
