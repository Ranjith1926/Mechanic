import { NotificationsList } from "@/components/notifications/NotificationsList";

export default function MechanicNotificationsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
      <p className="mt-1 text-sm text-gray-500">Notifications sent to clients across all services and invoices.</p>
      <div className="mt-4">
        <NotificationsList showClientName />
      </div>
    </div>
  );
}
