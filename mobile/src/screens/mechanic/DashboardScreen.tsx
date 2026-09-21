import React from "react";
import { StyleSheet, Text } from "react-native";
import { Screen } from "../../components/Screen";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme";

export function MechanicDashboardScreen() {
  const { user } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Welcome back, {user?.name}</Text>
      <Text style={styles.subtitle}>
        The revenue and follow-up dashboard will appear here once this screen is built out.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm },
});
