import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AxiosError } from "axios";
import { sparePartService } from "../../api/sparePartService";
import { Service, ServicePart, SparePart, SparePartAction } from "../../types/domain";
import { Button, Card, EmptyState, ErrorText, Field } from "../ui";
import { FormModal } from "../FormModal";
import { colors, spacing } from "../../theme";

const ACTIONS: SparePartAction[] = ["Inspected", "Reused", "Replaced", "Added", "Removed"];

export function ServicePartsSection({ service, onChange }: { service: Service; onChange: (updated: Service) => void }) {
  const [catalog, setCatalog] = useState<SparePart[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    sparePartService.list().then(setCatalog);
  }, []);

  async function handleRemove(part: ServicePart) {
    setRemovingId(part.id);
    try {
      const updated = await sparePartService.removeFromService(service.id, part.id);
      onChange(updated);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <View style={{ marginTop: spacing.lg }}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Spare Parts</Text>
        <TouchableOpacity onPress={() => setIsFormOpen(true)}>
          <Text style={styles.addLink}>+ Add Part</Text>
        </TouchableOpacity>
      </View>

      {service.parts.length === 0 ? (
        <EmptyState message="No parts recorded for this service yet." />
      ) : (
        service.parts.map((part) => (
          <Card key={part.id} style={{ marginBottom: spacing.sm }}>
            <View style={styles.partHeader}>
              <Text style={styles.partName}>
                {part.sparePartName} — {part.action}
              </Text>
              <TouchableOpacity onPress={() => handleRemove(part)} disabled={removingId === part.id}>
                <Text style={styles.removeLink}>{removingId === part.id ? "..." : "Remove"}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.partMeta}>
              {part.quantity} × Rs. {part.unitPrice.toLocaleString()} = Rs. {part.totalPrice.toLocaleString()}
            </Text>
            {part.action === "Replaced" && (part.oldPartDescription || part.newPartDescription) && (
              <Text style={styles.partMeta}>
                {part.oldPartDescription ?? "—"} → {part.newPartDescription ?? "—"}
              </Text>
            )}
          </Card>
        ))
      )}

      <AddPartModal
        serviceId={service.id}
        catalog={catalog}
        visible={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAdded={(updated) => {
          setIsFormOpen(false);
          onChange(updated);
        }}
      />
    </View>
  );
}

function AddPartModal({
  serviceId,
  catalog,
  visible,
  onClose,
  onAdded,
}: {
  serviceId: number;
  catalog: SparePart[];
  visible: boolean;
  onClose: () => void;
  onAdded: (updated: Service) => void;
}) {
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [action, setAction] = useState<SparePartAction>("Replaced");
  const [oldDesc, setOldDesc] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setSelectedPart(null);
    setQuantity("1");
    setAction("Replaced");
    setOldDesc("");
    setNewDesc("");
    setError(null);
  }

  async function handleSubmit() {
    if (!selectedPart) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await sparePartService.addToService(serviceId, {
        sparePartId: selectedPart.id,
        quantity: Number(quantity) || 1,
        action,
        oldPartDescription: action === "Replaced" ? oldDesc || undefined : undefined,
        newPartDescription: action === "Replaced" ? newDesc || undefined : undefined,
      });
      reset();
      onAdded(updated);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not add part.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal
      visible={visible}
      title="Add Part"
      onClose={() => {
        reset();
        onClose();
      }}
    >
      {!selectedPart ? (
        catalog.length === 0 ? (
          <EmptyState message="No spare parts in the catalog yet. Add some from the Spare Parts tab." />
        ) : (
          catalog.map((part) => (
            <TouchableOpacity key={part.id} style={styles.catalogRow} onPress={() => setSelectedPart(part)}>
              <Text style={styles.partName}>{part.name}</Text>
              <Text style={styles.partMeta}>
                {part.brand ? `${part.brand} · ` : ""}Rs. {part.defaultPrice.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))
        )
      ) : (
        <View>
          <TouchableOpacity onPress={() => setSelectedPart(null)}>
            <Text style={styles.addLink}>← Choose a different part</Text>
          </TouchableOpacity>
          <Text style={[styles.partName, { marginTop: spacing.sm }]}>{selectedPart.name}</Text>

          <View style={{ marginTop: spacing.sm }}>
            <Text style={styles.fieldLabel}>Action</Text>
            <View style={styles.actionRow}>
              {ACTIONS.map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setAction(a)}
                  style={[styles.actionChip, action === a && styles.actionChipActive]}
                >
                  <Text style={[styles.actionChipText, action === a && styles.actionChipTextActive]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Field label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />

          {action === "Replaced" && (
            <>
              <Field label="Old Part Description" value={oldDesc} onChangeText={setOldDesc} placeholder="e.g. Worn brake pad" />
              <Field label="New Part Description" value={newDesc} onChangeText={setNewDesc} placeholder="e.g. Honda OEM brake pad" />
            </>
          )}

          {error && <ErrorText message={error} />}

          <View style={{ marginTop: spacing.md }}>
            <Button title="Add part" onPress={handleSubmit} loading={isSubmitting} />
          </View>
        </View>
      )}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  addLink: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  removeLink: { color: colors.danger, fontWeight: "600", fontSize: 13 },
  partHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  partName: { fontSize: 14, fontWeight: "600", color: colors.text },
  partMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  catalogRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 4 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md },
  actionChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  actionChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionChipText: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  actionChipTextActive: { color: "#fff" },
});
