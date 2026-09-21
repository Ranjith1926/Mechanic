import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { notificationService } from "../../api/notificationService";
import { AppNotification } from "../../types/domain";
import { Badge, EmptyState, LoadingView } from "../ui";
import { colors, spacing } from "../../theme";

const TYPE_LABELS: Record<string, string> = {
  ServiceCompleted: "Service Completed",
  InvoiceCreated: "Invoice Generated",
  FollowUpReminder: "Follow-up Reminder",
  GeneralNotification: "Notification",
};

export function NotificationsList({
  showClientName = false,
  allowMarkRead = false,
}: {
  showClientName?: boolean;
  allowMarkRead?: boolean;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setNotifications(await notificationService.list());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handlePress(notification: AppNotification) {
    if (!allowMarkRead || notification.isRead) return;
    await notificationService.markRead(notification.id);
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
  }

  if (isLoading) {
    return <LoadingView />;
  }

  if (notifications.length === 0) {
    return <EmptyState message="No notifications yet." />;
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handlePress(item)}
          disabled={!allowMarkRead || item.isRead}
          style={[styles.row, !item.isRead && allowMarkRead && styles.rowUnread]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{item.createdAt && new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
          <View style={styles.footer}>
            <Badge text={TYPE_LABELS[item.type] ?? item.type} />
            {showClientName && <Text style={styles.clientName}>{item.clientName}</Text>}
            {!item.isRead && allowMarkRead && <Text style={styles.unreadHint}>Tap to mark as read</Text>}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { padding: spacing.lg },
  row: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowUnread: { borderColor: colors.primary, backgroundColor: "#eff6ff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 14, fontWeight: "600", color: colors.text, flex: 1 },
  time: { fontSize: 11, color: colors.textMuted },
  message: { fontSize: 13, color: colors.text, marginTop: 4 },
  footer: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
  clientName: { fontSize: 12, color: colors.textMuted },
  unreadHint: { fontSize: 12, color: colors.primary, fontWeight: "600" },
});
