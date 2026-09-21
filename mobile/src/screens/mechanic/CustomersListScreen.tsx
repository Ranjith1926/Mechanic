import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AxiosError } from "axios";
import { clientService } from "../../api/clientService";
import { Client } from "../../types/domain";
import { Badge, ErrorText, Fab, Field, LoadingView, EmptyState, Button } from "../../components/ui";
import { FormModal } from "../../components/FormModal";
import { colors, spacing } from "../../theme";
import type { CustomersStackParamList } from "../../navigation/CustomersStack";

type Props = NativeStackScreenProps<CustomersStackParamList, "CustomersList">;

export function CustomersListScreen({ navigation }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = useCallback(async (q?: string) => {
    setIsLoading(true);
    try {
      const data = q ? await clientService.search(q) : await clientService.list();
      setClients(data);
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
      <View style={styles.searchRow}>
        <Field label="" placeholder="Search by name, phone, or bike no." value={query} onChangeText={(t) => {
          setQuery(t);
          load(t.trim() || undefined);
        }} />
      </View>

      {isLoading ? (
        <LoadingView />
      ) : clients.length === 0 ? (
        <EmptyState message="No customers found." />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate("CustomerBikes", { clientId: item.id, clientName: item.name })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
              <Badge text={`${item.bikeCount} bike${item.bikeCount === 1 ? "" : "s"}`} />
              {!item.isActive && <Badge text="Inactive" tone="warning" />}
            </TouchableOpacity>
          )}
        />
      )}

      <Fab onPress={() => setIsFormOpen(true)} />

      <NewCustomerModal
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

function NewCustomerModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await clientService.create({ name, phone, email: email || undefined, address: address || undefined });
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      onCreated();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not create customer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal visible={visible} title="Add Customer" onClose={onClose}>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Address (optional)" value={address} onChangeText={setAddress} />
      {error && <ErrorText message={error} />}
      <View style={{ marginTop: spacing.md }}>
        <Button title="Save customer" onPress={handleSubmit} loading={isSubmitting} />
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  listContent: { padding: spacing.lg, paddingTop: spacing.sm },
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
  phone: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
