import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { invoiceService } from "../../api/invoiceService";
import { Invoice } from "../../types/domain";
import { Badge, EmptyState, LoadingView } from "../../components/ui";
import { colors, spacing } from "../../theme";
import type { InvoicesStackParamList } from "../../navigation/InvoicesStack";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoicesList">;

export function InvoicesListScreen({ navigation }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setInvoices(await invoiceService.list());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingView />
      ) : invoices.length === 0 ? (
        <EmptyState message="No invoices yet. Generate one from a completed service." />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate("InvoiceDetail", { invoiceId: item.id })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.invoiceNumber}</Text>
                <Text style={styles.subtitle}>
                  {item.clientName} · {item.bikeLabel}
                </Text>
                <Text style={styles.subtitle}>{new Date(item.invoiceDate).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={styles.amount}>Rs. {item.totalAmount.toLocaleString()}</Text>
                {item.isVoided && <Badge text="VOID" tone="danger" />}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  amount: { fontSize: 14, fontWeight: "600", color: colors.text },
});
