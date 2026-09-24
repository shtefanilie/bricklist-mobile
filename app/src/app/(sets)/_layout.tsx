import { Stack } from 'expo-router';

export default function SetsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[setNumber]" options={{ title: 'Set details' }} />
    </Stack>
  );
}
