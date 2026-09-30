import axios from 'axios'
import {computed, reactive} from 'vue'
import {cloneDeep, isEqual} from 'lodash-es'
import {lsGet, lsSet} from './storage'
import {simpleClone} from './utils'
import {withDefaults} from './alertSettings'

// Empty base URL = same domain. In development Vite proxies /api to the backend (see vite.config.js).
const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
})

const LS_TOKEN_KEY = 'settingsToken'

export const KEY_MESSENGER = '_messenger'

function initialState() {
    return {
        token: '',
        messenger: {
            platform: '',
            username: '',
            name: '',
        },
        loading: true,
        isError: false,
        errorText: '',
        settings: {},
        nodesList: [],
        original: {
            settings: {},
            nodesList: [],
        },
        loadIteration: 0,
    }
}

// Single source of truth for the settings session
export const store = reactive(initialState())
store.token = lsGet(LS_TOKEN_KEY, '')

// ---- derived state ----

export const isTokenLoading = computed(() => store.loading)
export const tokenErrorText = computed(() => store.errorText)
export const messengerInfo = computed(() => store.messenger)

export const validConnection = computed(() => Boolean(store.token) && !store.loading && !store.isError)

export const isSlack = computed(() => String(store.messenger.platform).toLowerCase() === 'slack')

export const isSettingsUpdated = computed(
    () => !isEqual(simpleClone(store.settings), simpleClone(store.original.settings))
)

export const isNodeListUpdated = computed(
    () => !isEqual(new Set(store.nodesList), new Set(store.original.nodesList))
)

export const isAnythingUpdated = computed(
    () => validConnection.value && (isSettingsUpdated.value || isNodeListUpdated.value)
)

// ---- actions ----

function settingsUrl() {
    return `/api/settings/${encodeURIComponent(store.token)}`
}

function saveTokenLocally() {
    lsSet(LS_TOKEN_KEY, store.token)
}

export function setToken(token) {
    store.token = token
}

// THORNode node list, proxied by our backend
export async function loadNodeList() {
    const response = await http.get('/api/nodes')
    return Array.isArray(response.data) ? response.data : []
}

export async function readSettings() {
    store.loading = true
    store.isError = false
    store.errorText = ''

    try {
        const {data} = await http.get(settingsUrl())
        if (data?.error) {
            store.isError = true
            store.errorText = data.error
            return
        }

        const settings = {...(data.settings ?? {})}
        store.messenger = cloneDeep(settings[KEY_MESSENGER]) ?? {
            platform: 'Unknown_Platform',
            name: 'NoName',
            username: 'NoUserName',
        }
        delete settings[KEY_MESSENGER]

        store.settings = settings
        store.nodesList = [...(data.nodes ?? [])]
        store.original.settings = cloneDeep(settings)
        store.original.nodesList = cloneDeep(store.nodesList)
        store.loadIteration++

        console.debug('readSettings()', simpleClone(store))

        saveTokenLocally()
    } catch (e) {
        console.error(e)
        store.isError = true
        store.errorText = e.response?.data?.error || 'network error'
    } finally {
        store.loading = false
    }
}

export function restoreOriginalNodes() {
    store.nodesList = cloneDeep(store.original.nodesList)
}

export function restoreOriginalSettings() {
    store.settings = cloneDeep(store.original.settings)
}

async function writeSettings() {
    store.loading = true
    try {
        const payload = {
            // Persist every alert setting the UI displays, including untouched defaults
            settings: {
                ...withDefaults(store.settings),
                [KEY_MESSENGER]: store.messenger,
            },
            nodes: store.nodesList,
        }
        console.debug('writeSettings()', simpleClone(payload))
        const {data} = await http.post(settingsUrl(), payload)
        if (data?.error) {
            store.isError = true
            store.errorText = data.error
            throw new Error(data.error)
        }
    } finally {
        store.loading = false
    }
}

// Returns true on success
export async function saveSettings() {
    try {
        await writeSettings()
        await readSettings()
    } catch (e) {
        console.error('Failed to save settings', e)
        return false
    }
    return !store.isError
}

export async function revokeLink() {
    store.loading = true
    try {
        const {data} = await http.delete(settingsUrl())
        if (data?.error) {
            console.error('Revoke error:', data.error)
        }
    } catch (e) {
        console.error('Failed to revoke the link', e)
    } finally {
        purgeData()
        store.loading = false
    }
}

export function purgeData() {
    Object.assign(store, initialState())
    saveTokenLocally()
}
