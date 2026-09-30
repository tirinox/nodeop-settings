import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// Backend (thorchain monitor bot) that serves /api/* in development.
// In production the SPA is served from the same domain as the API.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'http://127.0.0.1:8088'

export default defineConfig({
    plugins: [
        vue(),
        vuetify({autoImport: true}),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: API_PROXY_TARGET,
                changeOrigin: true,
            },
        },
    },
})
