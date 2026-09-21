import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AxiosError } from "axios";
import { sparePartService } from "../../api/sparePartService";
import { SparePart } from "../../types/domain";
import { Button, EmptyState, ErrorText, Fab, Field, LoadingView } from "../../components/ui";
import { FormModal } from "../../components/FormModal";
import { colors, spacing } from "../../theme";

export function SparePartsCatalogScreen() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setParts(await sparePartService.list());
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
      ) : parts.length === 0 ? (
        <EmptyState message="No spare parts yet." />
      ) : (
        <FlatList
          data={parts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle}>
                {item.brand ? `${item.brand} · ` : ""}Rs. {item.defaultPrice.toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}

      <Fab onPress={() => setIsFormOpen(true)} />

      <NewPartModal
        visible={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={() => {
          setIsFormOpen(false);
          load();
        }}
      />
    </View>
  );
}

function NewPartModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await sparePartService.create({ name, brand: brand || undefined, defaultPrice: Number(defaultPrice) || 0 });
      setName("");
      setBrand("");
      setDefaultPrice("0");
      onCreated();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not add spare part.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal visible={visible} title="Add Spare Part" onClose={onClose}>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field label="Brand (optional)" value={brand} onChangeText={setBrand} />
      <Field label="Default Price (Rs.)" value={defaultPrice} onChangeText={setDefaultPrice} keyboardType="decimal-pad" />
      {error && <ErrorText message={error} />}
      <View style={{ marginTop: spacing.md }}>
        <Button title="Save part" onPress={handleSubmit} loading={isSubmitting} />
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.lg },
  row: {
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
