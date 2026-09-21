import { NotificationsList } from "@/components/notifications/NotificationsList";

export default function ClientNotificationsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
      <div className="mt-4">
        <NotificationsList allowMarkRead />
      </div>
    </div>
  );
}
