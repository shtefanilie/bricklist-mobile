# Task 3: Smooth Out the Bricks

**Timebox:** 25 minutes

## Mission

Image requests finish at different times. The page should stay steady while they arrive, and scrolling should not render every set card at once. Make BrickList reserve image space and render results with a virtualized list.

The screen currently adds a random delay after each image loads and changes that image from zero height to full height. I've done this on purpose to simulate bad internet connection and to emphasize the importance of a good list management library.
This makes cards jump around. It also renders the page with a `ScrollView` and `.map()`, which does not scale to longer result lists.

## Build this

1. Give every image a fixed height so slow images do not move nearby cards.
2. Use `expo-image` for a short cross-fade and set `recyclingKey` to the set number.
3. Install `@legendapp/list` with `npx expo install @legendapp/list`.
4. Replace the current way we render the list with `LegendList`
5. Use `numColumns` for grid and list modes, key the list by layout mode, use `keyExtractor` for set numbers, and enable `recycleItems` after removing card-local state.
6. Using the built in [infinite scrolling](https://www.legendapp.com/open-source/list/v2/examples/infinite-scrolling/) remove the pagination and make the app way smoother.

Legend List is written in TypeScript and has no native dependency, so it works in Expo Go. Its API follows React Native's list components closely.

## Finish line

- Cards reserve image space before each image response finishes.
- Images fade in without pushing text or neighboring cards around.
- Only visible result rows are rendered and recycled by `LegendList`.
- Grid/list switching, search, pagination, loading, empty, error, and retry still work.
- Infinite scrolling for endless fun!

## Helpful prompt

`Replace this ScrollView and map with LegendList while preserving the header, empty state, error state, pagination, and grid toggle. Keep image dimensions stable while requests finish.`
