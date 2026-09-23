# Task 4: Cross The Native Boundary

**Timebox:** 40 minutes

## Mission

See the line between JavaScript that runs in Expo Go and code that needs a development build. Your facilitator will announce the one approved package, version, branch, and device path for this task.

Do not install a random native package. This is the bit where random copy-paste becomes a small bonfire.

## Shared steps

1. Choose one of the two packages suggested.
2. Read the package's setup notes with your pair.
3. Install it and make any announced app configuration change.
4. Run `npx expo prebuild` when the facilitator says to do so.
5. Use the prepared development client or the supported local build path.
6. Prove the feature works on a physical device, or switch to the prepared fallback with a helper.

## If the selected package is `react-native-mmkv`

Build a favourites feature:

1. Let a person save a set number as a favourite.
2. Show which set is favourited.
3. Restart the app and prove the favourite remains.

## If the selected package is `react-native-vision-camera`

Build the prepared scan flow:

1. Request camera permission using the facilitator's tested setup.
2. Scan the prepared LEGO barcode.
3. Show the scanned set number or request its matching set.

## Finish line

- You can explain why the package did not work in plain Expo Go.
- You completed the feature, or used the prepared fallback and can explain why.

## If blocked

Pair with a helper. Native build trouble is expected workshop material, not a personal failing. The prepared client or demo keeps the learning moving.
