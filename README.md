# nodeop-settings

Web UI for configuring personal alerts of the THORChain NodeOp monitoring bot
(watchlist of nodes + alert types). Open it via the setup link the bot gives you (`/?token=...`).

Built with Vue 3, Vuetify 4 and Vite. Requires Node.js 20.19+ or 22.13+.

## Project setup
```
npm install
```

### Development
```
npm run dev
```
The dev server proxies `/api` to `http://127.0.0.1:8088` (override with `API_PROXY_TARGET`).
No backend at hand? Run the mock API in another terminal and open http://localhost:5173/?token=demo
```
npm run mock
```

### Production build
```
npm run build
```
Output goes to `dist/`. Serve it from the same domain as the API with an `index.html` fallback
for client-side routes. Use `npm run preview` to check the build locally.

### Lint
```
npm run lint
```

See [AGENTS.md](AGENTS.md) for the architecture overview.
