import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { api, type PolicyRow } from "../src/api";
import { Banner, Field, PrimaryButton, Screen, screenStyles } from "../src/screen-ui";
import { colors } from "../src/theme";

export default function SaleScreen() {
  const [serialNumber, setSerialNumber] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [policyId, setPolicyId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .policies()
      .then((p) => {
        setPolicies(p);
        if (p[0]) setPolicyId(p[0].id);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  const submit = async () => {
    setError(null);
    setResult(null);
    if (!serialNumber.trim() || !customerMobile.trim() || !policyId) {
      setError("Serial number, customer mobile, and policy are required.");
      return;
    }
    setBusy(true);
    try {
      const res = (await api.registerSale({
        serialNumber: serialNumber.trim(),
        customerMobile: customerMobile.trim(),
        policyId
      })) as { status: string; backdated: boolean; expiryDate: string };
      setResult(
        res.backdated
          ? `Submitted for approval (backdated). Warranty expires ${res.expiryDate}.`
          : `Warranty activated. Expires ${res.expiryDate}.`
      );
      setSerialNumber("");
      setCustomerMobile("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      title="Register a sale"
      subtitle="Activate a customer warranty for a battery in your inventory."
    >
      <Field
        label="Battery serial number"
        value={serialNumber}
        onChangeText={setSerialNumber}
        placeholder="e.g. AB24-009184"
        autoCapitalize="characters"
      />
      <Field
        label="Customer mobile"
        value={customerMobile}
        onChangeText={setCustomerMobile}
        placeholder="10-digit mobile"
        keyboardType="number-pad"
        maxLength={10}
      />

      <View style={{ marginTop: 14 }}>
        <Text style={{ color: colors.inkSoft, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>
          Warranty policy
        </Text>
        {policies.map((p) => {
          const selected = p.id === policyId;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPolicyId(p.id)}
              style={[
                screenStyles.card,
                { borderColor: selected ? colors.brand : colors.line, borderWidth: selected ? 2 : 1 }
              ]}
            >
              <Text style={screenStyles.rowTitle}>{p.productName}</Text>
              <Text style={screenStyles.rowMeta}>
                {p.freeReplacementMonths} mo free · {p.totalWarrantyMonths} mo total
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Banner kind="bad">{error}</Banner> : null}
      {result ? <Banner kind="ok">{result}</Banner> : null}

      <PrimaryButton label="Activate warranty" busy={busy} onPress={submit} />
    </Screen>
  );
}
