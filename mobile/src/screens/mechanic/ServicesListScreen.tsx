import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { serviceService } from "../../api/serviceService";
import { Service, ServiceStatus } from "../../types/domain";
import { Badge, EmptyState, LoadingView } from "../../components/ui";
import { colors, spacing } from "../../theme";
import type { ServicesStackParamList } from "../../navigation/ServicesStack";

type Props = NativeStackScreenProps<ServicesStackParamList, "ServicesList">;

const TABS: { label: string; value?: ServiceStatus }[] = [
  { label: "All" },
  { label: "New", value: "New" },
  { label: "In Progress", value: "InProgress" },
  { label: "Completed", value: "Completed" },
];

const STATUS_TONE: Record<ServiceStatus, "default" | "success" | "warning"> = {
  New: "warning",
  InProgress: "default",
  Completed: "success",
};

export function ServicesListScreen({ navigation }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [tab, setTab] = useState<ServiceStatus | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (status?: ServiceStatus) => {
    setIsLoading(true);
    try {
      setServices(await serviceService.list(status));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(tab);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.label}
            onPress={() => setTab(t.value)}
            style={[styles.tab, tab === t.value && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t.value && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <LoadingView />
      ) : services.length === 0 ? (
        <EmptyState message="No services found. Start one from a bike's page." />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate("ServiceDetail", { serviceId: item.id })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.clientName}</Text>
                <Text style={styles.subtitle}>
                  {item.bikeLabel} ({item.bikeRegistrationNumber})
                </Text>
                <Text style={styles.subtitle}>{new Date(item.serviceDate).toLocaleDateString()}</Text>
              </View>
              <Badge text={item.status} tone={STATUS_TONE[item.status]} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, padding: spacing.lg, paddingBottom: 0 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  listContent: { padding: spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: { fontSize: 15, fontWeight: "600", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
