import React from "react";
import { View } from "react-native";
import { NotificationsList } from "../../components/notifications/NotificationsList";
import { colors } from "../../theme";

export function MechanicNotificationsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NotificationsList showClientName />
    </View>
  );
}
