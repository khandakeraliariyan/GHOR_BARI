# Selenium E2E tests

Real-browser tests (Chrome via `selenium-webdriver`) that drive the actual
running app — Firebase auth, the Express API, and MongoDB — through Mocha.

## Prerequisites

Both servers must be running first:

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd client && npm run dev
```

## Run

```bash
cd client
npm run test:e2e
```

Env vars:
- `E2E_BASE_URL` — defaults to `http://localhost:5173`.
- `HEADLESS=false` — run with a visible Chrome window (default is headless).

## Notes

- Login flows use the seeded "Quick Login" buttons on `/login`
  (`client/src/Pages/LoginPage.jsx`) rather than typing credentials, so
  tests exercise real Firebase sign-in without hardcoding form typing.
- Comparison state lives only in React context (no persistence), so tests
  that depend on a prior "add to compare" step avoid full page reloads
  (`driver.get`) in between — a reload wipes the selection, same as it
  would for a real user.
- Marketplace-dependent tests (opening a property, wishlisting, comparing)
  skip themselves if no properties exist in the connected database.
- The post-login toast and the navbar's Logout/notification controls both
  sit top-right and can overlap for ~3s after any toast-triggering action
  — the `quickLogin` helper waits it out before returning.
