import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

export function Screen({
  children,
  scroll = true,
  style,
  floating,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** Rendered outside the scroll view, e.g. a Fab that should stay fixed on screen. */
  floating?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      {scroll ? (
        <ScrollView style={[styles.container, style]} contentContainerStyle={styles.scrollContent}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, style]}>{children}</View>
      )}
      {floating}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
});
