import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NativeTabs minimizeBehavior="onScrollDown">
        <NativeTabs.Trigger name="(sets)">
          <NativeTabs.Trigger.Icon
            md="view_module"
            sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          />
          <NativeTabs.Trigger.Label>Sets</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="account">
          <NativeTabs.Trigger.Icon md="person" sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} />
          <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
