# AGENTS.md — guide for AI coding agents

## What this is

`nodeop-settings` is a small single-page web app where THORChain node operators configure
personal alerts of the **NodeOp / THORChain Monitoring Bot** (Telegram, Slack, Discord).
The bot gives the user a link `https://<host>/?token=<secret>`; the app loads that user's
settings by token, lets them pick nodes to watch and tune alert types, and saves back.

The backend is **not** in this repo (it's the bot, `tirinox/thorchainmonitorbot`). This app
only talks to its HTTP API. In production the SPA is served from the same domain as the API.

## Stack

- Vue 3.5 (`<script setup>`, Composition API), no Pinia — state is a `reactive()` store
- Vuetify 4 (Material Design 3), MDI icon font (`@mdi/font`, bundled locally)
- vue-router 5 (HTML5 history mode)
- Vite 8 (+ `vite-plugin-vuetify` for component auto-import / tree-shaking)
- axios, lodash-es (`isEqual`, `cloneDeep`), millify
- ESLint 10 flat config (`eslint.config.js`, `plugin:vue/essential` + `eslint:recommended`)
- Plain JavaScript (no TypeScript), npm, Node `^20.19 || >=22.13` (see `.nvmrc`)

## Repo map

```
index.html                  Vite entry HTML (title, favicons, Roboto font link)
vite.config.js              Vue + Vuetify plugins, `@` → src alias, dev proxy /api → backend
eslint.config.js            ESLint flat config
scripts/mock-api.js         In-memory fake backend for local dev (npm run mock, token "demo")
public/                     Static files copied as-is (favicons, logo png)
src/
  main.js                   createApp + vuetify + router
  App.vue                   Layout: app bar, nav drawer (permanent on desktop, temporary on mobile),
                            global snackbar, reads ?token= and loads settings, beforeunload guard
  plugins/vuetify.js        createVuetify: theme (light/dark/system + saved choice), component defaults
  router/index.js           Routes: /  /select/nodes  /alerts  (+ catch-all → /)
  service/
    api.js                  THE store + API. `store` (reactive), derived computeds
                            (validConnection, isSettingsUpdated, isNodeListUpdated, isAnythingUpdated, isSlack…)
                            and actions (readSettings, saveSettings, loadNodeList, revokeLink, restoreOriginal*)
    alertSettings.js        Alert setting keys + UI defaults (ALERT_DEFAULTS), STD_INTERVALS, readSetting()
    storage.js              localStorage wrapper, format-compatible with the old `vue-ls` plugin
    notify.js               Global snackbar state: notify(), notifySaveResult()
    utils.js                SliderConverter (non-linear slider mapping), time formatting, clipboard
  composables/useCopy.js    copy-to-clipboard with auto-resetting `copied` flag
  components/
    AlertToggle.vue         Switch + description block used for each alert type
    NodeListItem.vue        One node row (status avatar/chip, bond, watch/unwatch button)
    SaveResetButtons.vue    Save / Reset pair (shown when there are unsaved changes)
    CopyButton.vue, PausedLabel.vue, ThemeButton.vue, DialogConfirmRevokeLink.vue
  views/
    WelcomePage.vue         Start page: who is being configured, links, revoke link; error state if no token
    NodeSelectPage.vue      Watchlist: all nodes vs watched nodes, search + status filter, virtual lists
    AlertsPage.vue          Alert toggles and sliders, bound directly to store.settings
```

## Data flow & backend contract

- Token: `?token=` query param → `store.token`; after a successful read it is persisted to
  localStorage key `vuejs__settingsToken` (JSON `{value, expire}` — legacy vue-ls format, keep it
  so existing users stay logged in). Theme choice: `vuejs__themeIsDark`.
- `GET  /api/nodes` → array of THORNode nodes `{node_address, status, version, total_bond (1e8 units), …}`
- `GET  /api/settings/:token` → `{settings: {...}, nodes: [address…]}` or `{error}`
- `POST /api/settings/:token` body `{settings, nodes}` → `{error?}`
- `DELETE /api/settings/:token` → revokes the link
- `settings._messenger` = `{platform, name, username}`; it's stripped from `store.settings` on read
  and re-attached on write. On write, all `ALERT_DEFAULTS` keys are filled in so the backend
  stores exactly what the UI shows.
- Setting keys (`nop:*`, `gen:alerts`) are a contract with the backend — don't rename them.
- Dirty tracking: `store.original.{settings,nodesList}` is a snapshot of the last load;
  `isSettingsUpdated` / `isNodeListUpdated` compare against it. Reset = copy snapshot back.
- Alerts page has no local form state: every control is a computed get/set on `store.settings`,
  sliders go through `SliderConverter` (0..10000 internal, polynomial curve, optional snap-to list).

## Commands

```bash
npm install
npm run mock      # fake backend on :8088 (token: demo)
npm run dev       # Vite dev server on :5173, proxies /api → $API_PROXY_TARGET (default http://127.0.0.1:8088)
npm run build     # production build → dist/
npm run preview   # serve dist/ locally
npm run lint      # ESLint (must be clean)
```

Local check without the real bot: `npm run mock` + `npm run dev`, open `http://localhost:5173/?token=demo`.
`VITE_API_URL` can point the built app at a different API origin (default: same origin).

## Conventions

- 4-space indent, no semicolons, single quotes, `{a, b}` object braces without inner spaces
  (match surrounding code).
- New components: `<script setup>`, `defineProps` / `defineModel` / `defineEmits`.
- Import app modules via `@/…`; always include the `.vue` extension.
- Shared state goes into `service/api.js` (`store`) — don't introduce a second store or event bus.
- Vuetify 4 = Material 3 typography: use `text-display-*`, `text-headline-*`, `text-title-*`,
  `text-body-*`, `text-label-*` (not the old `text-h4` etc.). Colors: `amber-darken-1` style names.
- Vuetify components are auto-imported by `vite-plugin-vuetify`; don't register them manually.
- Keep user-visible copy as is unless asked; it mirrors the bot's wording.

## Verifying changes

1. `npm run lint && npm run build` — both must pass with no errors.
2. For UI changes run mock + dev and check `/`, `/select/nodes`, `/alerts` at desktop and ~375px width,
   in both light and dark theme: select/unselect nodes, Save, Reset, toggle alerts, move sliders.
3. There is no automated test suite.

## Deployment note

`vite build` emits `dist/index.html` + hashed files in `dist/assets/`. The server must fall back to
`index.html` for unknown paths (history-mode routing) and route `/api/*` to the bot backend.
