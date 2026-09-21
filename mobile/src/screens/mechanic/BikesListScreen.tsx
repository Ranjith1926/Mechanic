import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { bikeService } from "../../api/bikeService";
import { Bike } from "../../types/domain";
import { EmptyState, Field, LoadingView } from "../../components/ui";
import { colors, spacing } from "../../theme";
import type { BikesStackParamList } from "../../navigation/BikesStack";

type Props = NativeStackScreenProps<BikesStackParamList, "BikesList">;

export function BikesListScreen({ navigation }: Props) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (q?: string) => {
    setIsLoading(true);
    try {
      setBikes(await bikeService.list({ q }));
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
        <Field
          label=""
          placeholder="Search by registration, brand, or model"
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            load(t.trim() || undefined);
          }}
        />
      </View>

      {isLoading ? (
        <LoadingView />
      ) : bikes.length === 0 ? (
        <EmptyState message="No bikes found." />
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
              <Text style={styles.subtitle}>
                {item.registrationNumber} · {item.clientName}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  listContent: { padding: spacing.lg, paddingTop: spacing.sm },
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
