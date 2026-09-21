import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AxiosError } from "axios";
import { bikeService } from "../api/bikeService";
import { serviceService } from "../api/serviceService";
import { Bike, BikeHistoryItem } from "../types/domain";
import { Badge, Button, Card, EmptyState, ErrorText, Fab, Field, LoadingView } from "../components/ui";
import { FormModal } from "../components/FormModal";
import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";
import type { SharedDetailParamList } from "../navigation/types";

type Props = NativeStackScreenProps<SharedDetailParamList, "BikeDetail">;

const STATUS_TONE: Record<string, "default" | "success" | "warning"> = {
  New: "warning",
  InProgress: "default",
  Completed: "success",
};

export function BikeDetailScreen({ route, navigation }: Props) {
  const { bikeId } = route.params;
  const { user } = useAuth();
  const [bike, setBike] = useState<Bike | null>(null);
  const [history, setHistory] = useState<BikeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
    <Screen
      floating={
        user?.role === "Mechanic" ? (
          <>
            <Fab onPress={() => setIsFormOpen(true)} />
            <NewServiceModal
              bikeId={bikeId}
              visible={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              onCreated={(serviceId) => {
                setIsFormOpen(false);
                navigation.navigate("ServiceDetail", { serviceId });
              }}
            />
          </>
        ) : null
      }
    >
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

            {item.invoiceNumber && item.invoiceId && (
              <TouchableOpacity onPress={() => navigation.navigate("InvoiceDetail", { invoiceId: item.invoiceId! })}>
                <Text style={styles.invoiceLink}>
                  Invoice {item.invoiceNumber}: Rs. {item.invoiceTotal?.toLocaleString()} →
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}

function NewServiceModal({
  bikeId,
  visible,
  onClose,
  onCreated,
}: {
  bikeId: number;
  visible: boolean;
  onClose: () => void;
  onCreated: (serviceId: number) => void;
}) {
  const [odometer, setOdometer] = useState("0");
  const [complaint, setComplaint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const service = await serviceService.create({
        bikeId,
        odometer: Number(odometer) || 0,
        complaint: complaint || undefined,
        labourAmount: 0,
      });
      setOdometer("0");
      setComplaint("");
      onCreated(service.id);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not start service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal visible={visible} title="Start New Service" onClose={onClose}>
      <Field label="Current Odometer (km)" value={odometer} onChangeText={setOdometer} keyboardType="number-pad" />
      <Field label="Customer Complaint" value={complaint} onChangeText={setComplaint} />
      {error && <ErrorText message={error} />}
      <View style={{ marginTop: spacing.md }}>
        <Button title="Start service" onPress={handleSubmit} loading={isSubmitting} />
      </View>
    </FormModal>
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
  invoiceLink: { fontSize: 13, color: colors.primary, fontWeight: "600", marginTop: 6 },
});
