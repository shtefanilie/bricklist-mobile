# Task 4: Open the Box

**Timebox:** 30 minutes

## Mission

A list is useful, but people expect to tap an item and inspect it. Make every set card open a dedicated product details page. Keep the bottom tab navigator visible and put the Sets tab inside its own Stack so the native back button returns to the list.

## Route shape

Use a nested Stack inside the Sets tab:

```text
app/src/app/
  _layout.tsx
  account.tsx
  (sets)/
    _layout.tsx
    index.tsx
    [setNumber].tsx
```

The `(sets)` route group keeps the folder name out of the URL. Its `_layout.tsx` owns the Stack. Move the existing set list screen into `(sets)/index.tsx`, and update the Sets trigger in the root Native Tabs layout to point at `(sets)`.

## Build this

1. Add a Stack layout in `(sets)/_layout.tsx` with a list screen and a set-details screen.
2. Make each `SetCard` pressable.
3. On press, navigate to `(sets)/[setNumber]` and pass that card's `setNumber` as the route parameter.
4. Read `setNumber` with `useLocalSearchParams` on the details screen.
5. Add a `fetchSet(setNumber, signal?)` function to `app/src/api.ts` that requests `GET /sets/<setNumber>` and still sends `X-API-Key`.
6. Show loading and error states while requesting the selected set.
7. Render the set image and every available database field.
8. Confirm the native back button returns to the same Sets tab.

The detail endpoint is:

```text
GET /sets/10300-1
```

Encode the set number before adding it to the URL. Do not put the API key in route parameters, logs, screenshots, or source code.

## Available set data

The API and database expose these fields:

| Field | Type | What to show |
| --- | --- | --- |
| `setNumber` | string | Set number, for example `10300-1` |
| `name` | string | Set name |
| `theme` | string | LEGO theme |
| `year` | number | Release year |
| `pieceCount` | number | Number of pieces |
| `imageUrl` | string | Main set image |

The detail response has this shape:

```json
{
  "setNumber": "10300-1",
  "name": "Back to the Future Time Machine",
  "theme": "LEGO Icons",
  "year": 2022,
  "pieceCount": 1872,
  "imageUrl": "https://cdn.example/10300-1.jpg"
}
```

## Finish line

- Pressing any set opens the matching details screen.
- The details screen shows the image, set number, name, theme, year, and piece count.
- Loading and request failures have visible states.
- Back navigation returns to the set list without leaving the Sets tab.
- You can explain which layout owns the tabs and which layout owns the Stack.

## Helpful prompt

`Show me the smallest Expo Router route structure that nests a Stack inside my Sets native tab. Make each card open [setNumber].tsx and fetch that set from the existing detail endpoint.`
