import { useState } from "react";
import { api } from "../src/api";
import { Banner, Field, PrimaryButton, Screen } from "../src/screen-ui";

export default function DeliverScreen() {
  const [serialNumber, setSerialNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setResult(null);
    if (!serialNumber.trim()) {
      setError("Scan or enter a battery serial number.");
      return;
    }
    setBusy(true);
    try {
      await api.deliver(serialNumber.trim());
      setResult(`Delivery confirmed for ${serialNumber.trim()}.`);
      setSerialNumber("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      title="Confirm delivery"
      subtitle="Scan a battery and mark it as delivered to the destination. (Scanner integration comes next; enter the serial for now.)"
    >
      <Field
        label="Battery serial number"
        value={serialNumber}
        onChangeText={setSerialNumber}
        placeholder="e.g. AB24-007710"
        autoCapitalize="characters"
      />
      {error ? <Banner kind="bad">{error}</Banner> : null}
      {result ? <Banner kind="ok">{result}</Banner> : null}
      <PrimaryButton label="Mark delivered" busy={busy} onPress={submit} />
    </Screen>
  );
}
