import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { bikeService } from "../api/bikeService";
import { Bike, BikeHistoryItem } from "../types/domain";
import { Badge, Card, EmptyState, LoadingView } from "../components/ui";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";

type RouteParams = { BikeDetail: { bikeId: number } };
type Props = NativeStackScreenProps<RouteParams, "BikeDetail">;

const STATUS_TONE: Record<string, "default" | "success" | "warning"> = {
  New: "warning",
  InProgress: "default",
  Completed: "success",
};

export function BikeDetailScreen({ route }: Props) {
  const { bikeId } = route.params;
  const [bike, setBike] = useState<Bike | null>(null);
  const [history, setHistory] = useState<BikeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bikeData, historyData] = await Promise.all([bikeService.getById(bikeId), bikeService.getHistory(bikeId)]);
      setBike(bikeData);
      setHistory(historyData);
    } finally {
      setIsLoading(false);
    }
  }, [bikeId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (isLoading || !bike) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.bikeTitle}>
          {bike.brand} {bike.model}
          {bike.variant ? ` ${bike.variant}` : ""}
        </Text>
        <Text style={styles.bikeSub}>Registration: {bike.registrationNumber}</Text>
        <Text style={styles.bikeSub}>Odometer: {bike.currentOdometer.toLocaleString()} km</Text>
      </Card>

      <Text style={styles.sectionTitle}>Service History</Text>

      {history.length === 0 ? (
        <EmptyState message="No service records yet." />
      ) : (
        history.map((item) => (
          <Card key={item.serviceId} style={{ marginBottom: spacing.sm }}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDate}>{new Date(item.serviceDate).toLocaleDateString()}</Text>
              <Badge text={item.status} tone={STATUS_TONE[item.status] ?? "default"} />
            </View>

            {item.workPerformed && <Text style={styles.historyText}>{item.workPerformed}</Text>}

            {item.parts.length > 0 &&
              item.parts.map((part, index) => (
                <Text key={index} style={styles.partText}>
                  {part.partName} — {part.action}
                  {part.action === "Replaced" && part.oldPartDescription && part.newPartDescription
                    ? ` (${part.oldPartDescription} → ${part.newPartDescription})`
                    : ""}
                </Text>
              ))}

            {item.invoiceNumber && (
              <Text style={styles.historyText}>
                Invoice {item.invoiceNumber}: Rs. {item.invoiceTotal?.toLocaleString()}
              </Text>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bikeTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  bikeSub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  historyDate: { fontSize: 14, fontWeight: "600", color: colors.text },
  historyText: { fontSize: 13, color: colors.text, marginTop: 6 },
  partText: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
