"use client";

import { useEffect, useState } from "react";
import { notificationService } from "@/services/notificationService";
import { AppNotification } from "@/types/domain";

const TYPE_LABELS: Record<string, string> = {
  ServiceCompleted: "Service Completed",
  InvoiceCreated: "Invoice Generated",
  FollowUpReminder: "Follow-up Reminder",
  GeneralNotification: "Notification",
};

export function NotificationsList({ showClientName = false, allowMarkRead = false }: { showClientName?: boolean; allowMarkRead?: boolean }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    notificationService
      .list()
      .then(setNotifications)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleMarkRead(notification: AppNotification) {
    if (!allowMarkRead || notification.isRead) return;
    await notificationService.markRead(notification.id);
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  if (notifications.length === 0) {
    return <p className="text-sm text-gray-500">No notifications yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          onClick={() => handleMarkRead(notification)}
          className={`rounded-lg border p-4 text-sm ${
            !notification.isRead && allowMarkRead
              ? "cursor-pointer border-blue-200 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900">{notification.title}</p>
            <span className="text-xs text-gray-400">
              {notification.createdAt && new Date(notification.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-line text-gray-600">{notification.message}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <span className="rounded-full bg-gray-100 px-2 py-0.5">{TYPE_LABELS[notification.type] ?? notification.type}</span>
            {showClientName && <span>{notification.clientName}</span>}
            {!notification.isRead && allowMarkRead && <span className="text-blue-600">Tap to mark as read</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
