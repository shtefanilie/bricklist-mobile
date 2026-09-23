# Task 4: Cross The Native Boundary

**Timebox:** 40 minutes

## Mission

Expo Go is nice and all, but we we sadly have reached the limits of what we can do with it.
We now want to add libraries that allow us to do more complex things (Augmented reality, super fast local storage, etc).
But, in order to do that, we will need to run `prebuild`, and acutally have the app running on a simulator (or if you have an android phone and an usb cable, straight on your phone).

2 good examples are `react-native-mmkv` and `react-native-vision-camera`. Both of these are very popular, used in many common apps, and both need you to prebuild.

## Shared steps

1. Choose one of the two packages suggested.
2. Read the package's setup notes with your pair.
3. Install it and make any announced app configuration change.
4. Run `npx expo prebuild`.
5. Prove the feature works on a physical device, or simulator

## If the selected package is `react-native-mmkv`

Build a favourites feature:

1. Let a person save a set number as a favourite.
2. Show which set is favourited.
3. Restart the app and prove the favourite remains.

## If the selected package is `react-native-vision-camera`

Build the prepared scan flow:

1. Add a button on the PDP page created earlier that opens up the camera.
2. Render the set image on top of the camera feed.

## Finish line

- You can explain why the package did not work in plain Expo Go.
- You completed the feature, or used the prepared fallback and can explain why.