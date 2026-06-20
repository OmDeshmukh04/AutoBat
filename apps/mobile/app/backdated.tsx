import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { api, type BackdatedRow } from "../src/api";
import { Banner, Screen, screenStyles } from "../src/screen-ui";
import { colors } from "../src/theme";

export default function BackdatedScreen() {
  const [rows, setRows] = useState<BackdatedRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => {
    setError(null);
    api
      .backdatedQueue()
      .then(setRows)
      .catch((e) => setError((e as Error).message));
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id: string, decision: "APPROVE" | "REJECT") => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await api.decideBackdated(id, decision);
      setNotice(`Registration ${decision === "APPROVE" ? "approved" : "rejected"}.`);
      // Remove the decided row locally so the queue stays current.
      setRows((prev) => (prev ?? []).filter((r) => r.id !== id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen
      title="Backdated approvals"
      subtitle="Warranty registrations submitted outside the policy window need review."
    >
      {error ? <Banner kind="bad">{error}</Banner> : null}
      {notice ? <Banner kind="ok">{notice}</Banner> : null}

      {rows === null && !error ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />
      ) : null}

      {rows !== null && rows.length === 0 ? (
        <Banner kind="ok">No backdated registrations pending review.</Banner>
      ) : null}

      {(rows ?? []).map((r) => {
        const busy = busyId === r.id;
        return (
          <View key={r.id} style={screenStyles.card}>
            <Text style={screenStyles.rowTitle}>{r.serialNumber}</Text>
            <Text style={screenStyles.rowMeta}>
              {r.partner} · purchased {r.purchaseDate}
            </Text>
            <Text style={[screenStyles.rowMeta, { color: colors.warn, fontWeight: "700" }]}>
              {r.delayDays} days late · {r.reason}
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable
                disabled={busy}
                onPress={() => decide(r.id, "APPROVE")}
                style={{
                  alignItems: "center",
                  backgroundColor: colors.ok,
                  borderRadius: 8,
                  flex: 1,
                  minHeight: 44,
                  justifyContent: "center"
                }}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "800" }}>Approve</Text>
                )}
              </Pressable>
              <Pressable
                disabled={busy}
                onPress={() => decide(r.id, "REJECT")}
                style={{
                  alignItems: "center",
                  borderColor: colors.bad,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  minHeight: 44,
                  justifyContent: "center",
                  paddingHorizontal: 20
                }}
              >
                <Text style={{ color: colors.bad, fontWeight: "800" }}>Reject</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}
