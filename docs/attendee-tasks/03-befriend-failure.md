# Task 3: Befriend Failure

**Timebox:** 10 minutes

## Mission

Good apps do not pretend the network is magic. Make BrickList's loading, empty, and error states clear enough that a tired human knows what happened and what to do next.

The screen already has states for loading, success, empty results, and errors. First, trigger them. Then improve one message.

## Try this

1. Search for nonsense such as `definitely-not-a-lego-set` to trigger the empty state.
2. Temporarily replace the API key in `app/.env.local` with `nope`, restart Expo, and trigger the error state.
3. Restore the key from the workshop slides. Never commit it.
4. Press Retry and confirm results return.
5. Improve one loading, empty, or error message so it is useful and has a little BrickList personality.

## Finish line

- You have seen loading, success, empty, and error states on a real phone.
- Retry works after restoring valid configuration.
- Your improved message tells the person what happened or what to try next.
- No API key made it into Git, chat, screenshots, or an AI prompt.

## Helpful prompt

`Review these React Native messages for clarity. Suggest three concise alternatives, including what action the person should take. Do not change any network behaviour.`
