import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AxiosError } from "axios";
import { bikeService } from "../../api/bikeService";
import { Bike } from "../../types/domain";
import { Button, EmptyState, ErrorText, Fab, Field, LoadingView } from "../../components/ui";
import { FormModal } from "../../components/FormModal";
import { colors, spacing } from "../../theme";
import type { CustomersStackParamList } from "../../navigation/CustomersStack";

type Props = NativeStackScreenProps<CustomersStackParamList, "CustomerBikes">;

export function CustomerBikesScreen({ route, navigation }: Props) {
  const { clientId } = route.params;
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setBikes(await bikeService.list({ clientId }));
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingView />
      ) : bikes.length === 0 ? (
        <EmptyState message="No bikes registered for this customer yet." />
      ) : (
        <FlatList
          data={bikes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("BikeDetail", { bikeId: item.id })}>
              <Text style={styles.title}>
                {item.brand} {item.model}
              </Text>
              <Text style={styles.subtitle}>{item.registrationNumber}</Text>
              <Text style={styles.subtitle}>{item.currentOdometer.toLocaleString()} km</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Fab onPress={() => setIsFormOpen(true)} />

      <NewBikeModal
        clientId={clientId}
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

function NewBikeModal({
  clientId,
  visible,
  onClose,
  onCreated,
}: {
  clientId: number;
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [currentOdometer, setCurrentOdometer] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await bikeService.create({
        clientId,
        registrationNumber,
        brand,
        model,
        currentOdometer: Number(currentOdometer) || 0,
      });
      setRegistrationNumber("");
      setBrand("");
      setModel("");
      setCurrentOdometer("0");
      onCreated();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not add bike.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal visible={visible} title="Add Bike" onClose={onClose}>
      <Field label="Registration Number" value={registrationNumber} onChangeText={setRegistrationNumber} autoCapitalize="characters" />
      <Field label="Brand" value={brand} onChangeText={setBrand} />
      <Field label="Model" value={model} onChangeText={setModel} />
      <Field label="Odometer (km)" value={currentOdometer} onChangeText={setCurrentOdometer} keyboardType="number-pad" />
      {error && <ErrorText message={error} />}
      <View style={{ marginTop: spacing.md }}>
        <Button title="Save bike" onPress={handleSubmit} loading={isSubmitting} />
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
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
