import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { invoiceService } from "../api/invoiceService";
import { notificationService } from "../api/notificationService";
import { Invoice } from "../types/domain";
import { Badge, Button, Card, LoadingView } from "../components/ui";
import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { shareInvoicePdf, printInvoicePdf } from "../utils/pdf";
import { colors, spacing } from "../theme";
import type { SharedDetailParamList } from "../navigation/types";

type Props = NativeStackScreenProps<SharedDetailParamList, "InvoiceDetail">;

export function InvoiceDetailScreen({ route }: Props) {
  const { invoiceId } = route.params;
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [notifySent, setNotifySent] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setInvoice(await invoiceService.getById(invoiceId));
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (isLoading || !invoice) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }

  async function handleShare() {
    setIsBusy(true);
    try {
      await shareInvoicePdf(invoice!.id, invoice!.invoiceNumber);
    } catch {
      Alert.alert("Could not share invoice", "Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handlePrint() {
    setIsBusy(true);
    try {
      await printInvoicePdf(invoice!.id, invoice!.invoiceNumber);
    } catch {
      Alert.alert("Could not print invoice", "Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleNotify() {
    setIsBusy(true);
    try {
      await notificationService.notifyInvoiceCreated(invoice!.id);
      setNotifySent(true);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleVoid() {
    Alert.alert("Void this invoice?", "It will stay on record but be marked void.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Void",
        style: "destructive",
        onPress: async () => {
          setIsBusy(true);
          try {
            setInvoice(await invoiceService.void(invoice!.id));
          } finally {
            setIsBusy(false);
          }
        },
      },
    ]);
  }

  const isMechanic = user?.role === "Mechanic";

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{invoice.invoiceNumber}</Text>
          <Text style={styles.subtitle}>{new Date(invoice.invoiceDate).toLocaleDateString()}</Text>
        </View>
        {invoice.isVoided && <Badge text="VOID" tone="danger" />}
      </View>

      <View style={styles.grid}>
        <Card style={{ flex: 1 }}>
          <Text style={styles.cardLabel}>Bill To</Text>
          <Text style={styles.cardValue}>{invoice.clientName}</Text>
          <Text style={styles.cardSub}>{invoice.clientPhone}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={styles.cardLabel}>Vehicle</Text>
          <Text style={styles.cardValue}>{invoice.bikeLabel}</Text>
          <Text style={styles.cardSub}>{invoice.bikeRegistrationNumber}</Text>
        </Card>
      </View>

      <Card style={{ marginTop: spacing.md }}>
        {invoice.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemDesc}>{item.description}</Text>
            <Text style={styles.itemAmount}>Rs. {item.amount.toLocaleString()}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <TotalRow label="Labour" amount={invoice.labourAmount} />
        <TotalRow label="Spare Parts" amount={invoice.sparePartsAmount} />
        {invoice.discount > 0 && <TotalRow label="Discount" amount={-invoice.discount} />}
        {invoice.tax > 0 && <TotalRow label="Tax" amount={invoice.tax} />}
        <View style={styles.divider} />
        <TotalRow label="Total" amount={invoice.totalAmount} bold />
      </Card>

      <View style={styles.actions}>
        <Button title="Share / Download" onPress={handleShare} loading={isBusy} />
        <View style={{ height: spacing.sm }} />
        <Button title="Print" variant="secondary" onPress={handlePrint} loading={isBusy} />
        {isMechanic && (
          <>
            <View style={{ height: spacing.sm }} />
            <Button
              title={notifySent ? "Notified" : "Notify Client"}
              variant="secondary"
              onPress={handleNotify}
              disabled={notifySent}
              loading={isBusy}
            />
            {!invoice.isVoided && (
              <>
                <View style={{ height: spacing.sm }} />
                <Button title="Void Invoice" variant="danger" onPress={handleVoid} loading={isBusy} />
              </>
            )}
          </>
        )}
      </View>
    </Screen>
  );
}

function TotalRow({ label, amount, bold = false }: { label: string; amount: number; bold?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, bold && styles.totalBold]}>{label}</Text>
      <Text style={[styles.totalValue, bold && styles.totalBold]}>Rs. {amount.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  grid: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  cardLabel: { fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  cardValue: { fontSize: 14, fontWeight: "600", color: colors.text, marginTop: 4 },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  itemDesc: { fontSize: 13, color: colors.text },
  itemAmount: { fontSize: 13, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalLabel: { fontSize: 13, color: colors.textMuted },
  totalValue: { fontSize: 13, color: colors.text },
  totalBold: { fontWeight: "700", color: colors.text, fontSize: 14 },
  actions: { marginTop: spacing.lg },
});
