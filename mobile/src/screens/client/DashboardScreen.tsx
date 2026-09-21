import React from "react";
import { StyleSheet, Text } from "react-native";
import { Screen } from "../../components/Screen";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme";

export function ClientDashboardScreen() {
  const { user } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Welcome, {user?.name}</Text>
      <Text style={styles.subtitle}>Your bikes, recent services and follow-ups will appear here.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm },
});
