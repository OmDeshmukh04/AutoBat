import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../src/auth-store";
import { colors } from "../src/theme";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { token, hydrated, hydrate } = useAuthStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const onLogin = segments[0] === "login";
    if (!token && !onLogin) {
      router.replace("/login");
    } else if (token && onLogin) {
      router.replace("/");
    }
  }, [hydrated, token, segments, router]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
