import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AxiosError } from "axios";
import { serviceService } from "../api/serviceService";
import { invoiceService } from "../api/invoiceService";
import { notificationService } from "../api/notificationService";
import { Service, ServiceStatus } from "../types/domain";
import { Button, ErrorText, Field, LoadingView } from "../components/ui";
import { ServicePartsSection } from "../components/services/ServicePartsSection";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";
import type { SharedDetailParamList } from "../navigation/types";

type Props = NativeStackScreenProps<SharedDetailParamList, "ServiceDetail">;

const STATUS_OPTIONS: ServiceStatus[] = ["New", "InProgress", "Completed"];

export function ServiceDetailScreen({ route, navigation }: Props) {
  const { serviceId } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifySent, setNotifySent] = useState(false);

  const [odometer, setOdometer] = useState("0");
  const [complaint, setComplaint] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [labourAmount, setLabourAmount] = useState("0");
  const [status, setStatus] = useState<ServiceStatus>("New");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await serviceService.getById(serviceId);
      setService(data);
      setOdometer(String(data.odometer));
      setComplaint(data.complaint ?? "");
      setInspectionNotes(data.inspectionNotes ?? "");
      setWorkPerformed(data.workPerformed ?? "");
      setLabourAmount(String(data.labourAmount));
      setStatus(data.status);
      setNotes(data.notes ?? "");
    } catch {
      setError("Could not load this service.");
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await serviceService.update(serviceId, {
        odometer: Number(odometer) || 0,
        complaint: complaint || undefined,
        inspectionNotes: inspectionNotes || undefined,
        workPerformed: workPerformed || undefined,
        labourAmount: Number(labourAmount) || 0,
        status,
        notes: notes || undefined,
      });
      setService(updated);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !service) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }

  async function handleGenerateInvoice() {
    setInvoiceError(null);
    setIsGeneratingInvoice(true);
    try {
      const invoice = await invoiceService.create({ serviceId });
      navigation.navigate("InvoiceDetail", { invoiceId: invoice.id });
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setInvoiceError(axiosError.response?.data?.message ?? "Could not generate invoice.");
    } finally {
      setIsGeneratingInvoice(false);
    }
  }

  async function handleNotify() {
    setIsNotifying(true);
    try {
      await notificationService.notifyServiceCompleted(serviceId);
      setNotifySent(true);
    } finally {
      setIsNotifying(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>
        {service.clientName} — {service.bikeLabel}
      </Text>
      <Text style={styles.subtitle}>{service.bikeRegistrationNumber}</Text>

      {service.hasInvoice && service.invoiceId ? (
        <Button
          title="View Invoice"
          variant="secondary"
          onPress={() => navigation.navigate("InvoiceDetail", { invoiceId: service.invoiceId! })}
        />
      ) : service.status === "Completed" ? (
        <Button title="Generate Invoice" onPress={handleGenerateInvoice} loading={isGeneratingInvoice} />
      ) : (
        <Text style={styles.hint}>Complete the service to generate an invoice.</Text>
      )}
      {invoiceError && <ErrorText message={invoiceError} />}

      {service.status === "Completed" && (
        <>
          <View style={{ height: spacing.sm }} />
          <Button
            title={notifySent ? "Notified" : "Notify Client"}
            variant="secondary"
            onPress={handleNotify}
            disabled={notifySent}
            loading={isNotifying}
          />
        </>
      )}

      <View style={{ height: spacing.lg }} />

      <Field label="Odometer (km)" value={odometer} onChangeText={setOdometer} keyboardType="number-pad" />

      <Text style={styles.fieldLabel}>Status</Text>
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setStatus(option)}
            style={[styles.statusChip, status === option && styles.statusChipActive]}
          >
            <Text style={[styles.statusChipText, status === option && styles.statusChipTextActive]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Customer Complaint" value={complaint} onChangeText={setComplaint} multiline />
      <Field label="Inspection Notes" value={inspectionNotes} onChangeText={setInspectionNotes} multiline />
      <Field label="Work Performed" value={workPerformed} onChangeText={setWorkPerformed} multiline />
      <Field label="Labour Amount (Rs.)" value={labourAmount} onChangeText={setLabourAmount} keyboardType="decimal-pad" />
      <Field label="Notes" value={notes} onChangeText={setNotes} multiline />

      {error && <ErrorText message={error} />}

      <Button title="Save changes" onPress={handleSave} loading={isSaving} />

      <ServicePartsSection service={service} onChange={setService} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md },
  hint: { fontSize: 13, color: colors.textMuted, fontStyle: "italic" },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 },
  statusRow: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.md },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  statusChipTextActive: { color: "#fff" },
});
