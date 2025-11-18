# Pi Infinite Scroll

This small project demonstrates an infinite scrolling, virtualized list that shows the decimal digits of π (pi). It's optimized to avoid memory blowups by:

- generating digits server-side in chunks,
- loading them on demand,
- virtualizing the rendered DOM with `react-window` so only visible items are mounted.

## How it works (summary)

1. **Server-side chunking** — The API route `/api/pi` accepts `start` and `count` and returns `count` digits starting from `start` (0-based index after decimal point). The route uses a spigot algorithm to generate digits on demand.

2. **Client** — The `PiList` component:
   - keeps a `digits` array of loaded digits,
   - renders them using `react-window` `FixedSizeList` for virtualization,
   - uses the list `onScroll` event to detect when the user is near the bottom and fetch the next chunk from `/api/pi`.

3. **Memory safety** — Because we only render a tiny subset of list items at a time (virtualization), and because digits are fetched in controllable chunk sizes, the app avoids DOM and memory explosion. The server's compute cost is bounded by the requested chunk size.

## Local development

```bash
# install
npm install
# run dev
npm run dev
# open http://localhost:3000
```

## Notes, tradeoffs & QA guidance

- The spigot algorithm implementation is intentionally simple and synchronous. It is fine for moderate chunk sizes (up to a few thousand digits). If you plan to serve very large offsets or extremely large chunks you should:
  - move heavy computation to a background job or streaming endpoint,
  - or precompute and store digits in a performant store (Redis, S3) for quick range access.

- The API is stateless. To get digits starting at a high offset the server recomputes from the start — this is CPU-costly but simple. A production-ready implementation would cache ranges.

- **If QA tries to make the app run out of memory**:
  - virtualization prevents DOM bloat on the client.
  - server-side computation may still be heavy for huge `start` values; you should add server-side protection (max `count`, max `start`) and return 4xx when limits are exceeded. In this project the server caps `count` at 5000.

## Suggested improvements

- Add caching (LRU or Redis) for computed ranges.
- Add an edge or streaming endpoint to yield digits progressively instead of computing them synchronously.
- Add tests for the API route and UI.

```

---

## Final notes

This repository is a small, self-contained demo focused on memory-safe infinite scrolling of a huge logical list by combining **server chunking** and **client virtualization**.


```
