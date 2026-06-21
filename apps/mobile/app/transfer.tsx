import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  PackageCheck,
  Truck
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api, type PartnerRow } from "../src/api";
import { useAuthStore } from "../src/auth-store";
import {
  Banner,
  Field,
  PrimaryButton,
  Screen
} from "../src/screen-ui";
import { colors } from "../src/theme";

export default function TransferScreen() {
  const user = useAuthStore((state) => state.user);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [toOrgId, setToOrgId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api
      .partners()
      .then((rows) =>
        setPartners(rows.filter((partner) => partner.id !== user?.orgId))
      )
      .catch((loadError) => setError((loadError as Error).message));
  }, [user?.orgId]);

  const selectedPartner = partners.find(
    (partner) => partner.id === toOrgId
  );

  const submit = async () => {
    setError(null);
    setResult(null);
    const parsedQuantity = Number(quantity);
    if (!toOrgId || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("Choose a destination and enter a valid quantity.");
      return;
    }
    setBusy(true);
    try {
      const response = (await api.transfer({
        toOrgId,
        quantity: parsedQuantity
      })) as { reference: string };
      setResult(`Transfer ${response.reference} recorded successfully.`);
      setQuantity("");
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        <PrimaryButton
          busy={busy}
          icon={<Truck color="#FFFFFF" size={21} strokeWidth={2} />}
          label="Record transfer"
          onPress={submit}
        />
      }
      subtitle="Choose a downstream partner and record the number of batteries moving."
      title="Transfer stock"
    >
      <View style={styles.flowSummary}>
        <View style={styles.flowPoint}>
          <Building2 color={colors.ink} size={24} strokeWidth={1.8} />
          <Text numberOfLines={1} style={styles.flowName}>
            {user?.orgName ?? "Your organization"}
          </Text>
          <Text style={styles.flowLabel}>From</Text>
        </View>
        <ArrowRight color={colors.brand} size={24} strokeWidth={2} />
        <View style={styles.flowPoint}>
          <PackageCheck color={colors.ink} size={24} strokeWidth={1.8} />
          <Text numberOfLines={1} style={styles.flowName}>
            {selectedPartner?.name ?? "Select partner"}
          </Text>
          <Text style={styles.flowLabel}>To</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Destination partner</Text>
      <View style={styles.partnerList}>
        {partners.map((partner) => {
          const selected = partner.id === toOrgId;
          return (
            <Pressable
              key={partner.id}
              onPress={() => setToOrgId(partner.id)}
              style={[
                styles.partnerRow,
                selected && styles.partnerRowSelected
              ]}
            >
              <View
                style={[styles.radio, selected && styles.radioSelected]}
              />
              <View style={styles.partnerCopy}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerMeta}>
                  {partner.code} | {partner.type.replaceAll("_", " ")}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Field
        keyboardType="number-pad"
        label="Quantity"
        onChangeText={setQuantity}
        placeholder="Number of batteries"
        value={quantity}
      />

      {error ? <Banner kind="bad">{error}</Banner> : null}
      {result ? <Banner kind="ok">{result}</Banner> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flowSummary: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15
  },
  flowPoint: {
    alignItems: "center",
    flex: 1
  },
  flowName: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
    maxWidth: 120
  },
  flowLabel: {
    color: colors.inkFaint,
    fontSize: 10.5,
    marginTop: 3
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 9,
    marginTop: 18
  },
  partnerList: {
    gap: 8
  },
  partnerRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 64,
    padding: 12
  },
  partnerRowSelected: {
    borderColor: colors.brand,
    borderWidth: 2,
    padding: 11
  },
  radio: {
    borderColor: colors.lineStrong,
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    width: 18
  },
  radioSelected: {
    borderColor: colors.brand,
    borderWidth: 5
  },
  partnerCopy: {
    flex: 1
  },
  partnerName: {
    color: colors.ink,
    fontSize: 13.5,
    fontWeight: "800"
  },
  partnerMeta: {
    color: colors.inkSoft,
    fontSize: 11,
    marginTop: 4
  }
});
