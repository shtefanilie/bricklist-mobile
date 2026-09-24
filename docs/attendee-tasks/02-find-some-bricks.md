# Task 2: Find Some Bricks

**Timebox:** 25 minutes

## Mission

BrickList already calls the workshop API in `app/src/api.ts`. The route `app/src/app/index.tsx` loads `app/src/screens/home-screen.tsx`; pagination lives in `app/src/hooks/usePaginatedSets.ts`. Your job is to give people a way to choose what they fetch.

## Build this

1. Add a text input and a Search button to the home screen.
2. Keep the text the user is typing in React state, separate from the submitted search used by pagination.
3. Update `fetchSets` so it can optionally send `search=<text>` to the API.
4. Start the search from page 1 when the button is pressed.
5. Keep Previous and Next working for the current search.

The API supports this request shape:

```text
GET /sets?page=1&limit=20&search=gear
```

See the [API contract](../api-contract.md) for the full shape. The client must still send `X-API-Key`; `fetchSets` already does that part.

## Finish line

- Searching for a real word returns matching sets.
- Changing the search and pressing Search starts from page 1.
- Pagination keeps using the active search.
- You can explain where the input state lives and where the URL query parameter is built.

## Helpful prompt

`Show me the smallest change needed to add an optional search parameter to this fetch function. Explain each changed line; do not rewrite unrelated code.`
