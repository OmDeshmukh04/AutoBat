import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { api, type PartnerRow } from "../src/api";
import { useAuthStore } from "../src/auth-store";
import { Banner, Field, PrimaryButton, Screen, screenStyles } from "../src/screen-ui";
import { colors } from "../src/theme";

export default function TransferScreen() {
  const user = useAuthStore((s) => s.user);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [toOrgId, setToOrgId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .partners()
      .then((p) => setPartners(p.filter((x) => x.id !== user?.orgId)))
      .catch((e) => setError((e as Error).message));
  }, [user?.orgId]);

  const submit = async () => {
    setError(null);
    setResult(null);
    const qty = Number(quantity);
    if (!toOrgId || !qty || qty <= 0) {
      setError("Pick a destination partner and a positive quantity.");
      return;
    }
    setBusy(true);
    try {
      const res = (await api.transfer({ toOrgId, quantity: qty })) as { reference: string };
      setResult(`Transfer recorded (${res.reference}).`);
      setQuantity("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Transfer stock" subtitle="Move units to a downstream partner.">
      <View style={{ marginTop: 6 }}>
        <Text style={{ color: colors.inkSoft, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>
          Destination partner
        </Text>
        {partners.map((p) => {
          const selected = p.id === toOrgId;
          return (
            <Pressable
              key={p.id}
              onPress={() => setToOrgId(p.id)}
              style={[
                screenStyles.card,
                { borderColor: selected ? colors.brand : colors.line, borderWidth: selected ? 2 : 1 }
              ]}
            >
              <Text style={screenStyles.rowTitle}>{p.name}</Text>
              <Text style={screenStyles.rowMeta}>
                {p.code} · {p.type}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Field
        label="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Number of units"
        keyboardType="number-pad"
      />

      {error ? <Banner kind="bad">{error}</Banner> : null}
      {result ? <Banner kind="ok">{result}</Banner> : null}

      <PrimaryButton label="Record transfer" busy={busy} onPress={submit} />
    </Screen>
  );
}
