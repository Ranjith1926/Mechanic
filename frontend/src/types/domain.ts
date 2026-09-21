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

export type SparePartAction = "Inspected" | "Reused" | "Replaced" | "Added" | "Removed";

export interface ServicePart {
  id: number;
  sparePartId: number;
  sparePartName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  action: SparePartAction;
  oldPartDescription?: string | null;
  newPartDescription?: string | null;
  notes?: string | null;
}

export interface Service {
  id: number;
  bikeId: number;
  bikeRegistrationNumber: string;
  bikeLabel: string;
  clientId: number;
  clientName: string;
  mechanicId: number;
  mechanicName: string;
  serviceDate: string;
  odometer: number;
  complaint?: string | null;
  inspectionNotes?: string | null;
  workPerformed?: string | null;
  labourAmount: number;
  status: ServiceStatus;
  notes?: string | null;
  hasInvoice: boolean;
  invoiceId?: number | null;
  createdAt: string;
  completedAt?: string | null;
  parts: ServicePart[];
}

export interface SparePart {
  id: number;
  name: string;
  brand?: string | null;
  partNumber?: string | null;
  defaultPrice: number;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export type InvoiceItemCategory = "Labour" | "SparePart" | "Other";

export interface InvoiceItem {
  id: number;
  description: string;
  category: InvoiceItemCategory;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  serviceId: number;
  clientId: number;
  clientName: string;
  clientPhone: string;
  bikeId: number;
  bikeRegistrationNumber: string;
  bikeLabel: string;
  invoiceDate: string;
  labourAmount: number;
  sparePartsAmount: number;
  discount: number;
  tax: number;
  totalAmount: number;
  notes?: string | null;
  isVoided: boolean;
  createdAt: string;
  items: InvoiceItem[];
}

export type NotificationType = "ServiceCompleted" | "InvoiceCreated" | "FollowUpReminder" | "GeneralNotification";

export interface AppNotification {
  id: number;
  clientId: number;
  clientName: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: number | null;
  isRead: boolean;
  sentAt?: string | null;
  createdAt: string;
}
