import axios from "axios";
import Vue from "vue";
import _ from "lodash";
import {simpleClone} from "./utils";

const DEV_URL = 'http://127.0.0.1:8088'
const PROD_RUL = 'https://settings.thornode.org'

export const KEY_MESSENGER = '_messenger'

function tokenStoreInitialState() {
    return {
        token: '',
        messenger: {
            platform: '',
            username: '',
            name: '',
        },
        channelId: '',
        loading: true,
        isError: false,
        errorText: '',
        settings: {},
        nodesList: [],
        original: {
            settings: {},
            nodesList: []
        },
        loadIteration: 0
    }
}

export const TokenStore = Vue.observable(tokenStoreInitialState())

export const SettingsStorageMixin = {
    computed: {
        validConnection() {
            return Boolean(TokenStore.token) && !this.isTokenLoading && !TokenStore.isError
        },
        isTokenLoading() {
            return TokenStore.loading
        },
        tokenErrorText() {
            return TokenStore.errorText
        },
        channelId() {
            return TokenStore.channelId
        },
        messengerInfo() {
            return TokenStore.messenger
        },
        isSettingsUpdated() {
            const s1 = simpleClone(TokenStore.settings)
            const s2 = simpleClone(TokenStore.original.settings)
            const eq = _.isEqual(s1, s2)
            return !eq
        },
        isNodeListUpdated() {
            return !_.isEqual(new Set(TokenStore.nodesList), new Set(TokenStore.original.nodesList))
        },
        isAnythingUpdated() {
            return this.validConnection && (this.isSettingsUpdated || this.isNodeListUpdated)
        },
    },
    methods: {}
}

export class APIConnector {
    constructor() {
        this.url = process.env.NODE_ENV === 'development' ? DEV_URL : PROD_RUL
    }

    settingsUrl() {
        return `${this.url}/api/settings/${TokenStore.token}`
    }

    async readSettings() {
        TokenStore.loading = true
        try {
            const response = await axios.get(this.settingsUrl())
            const j = response.data
            if (j['error']) {
                TokenStore.isError = true
                TokenStore.errorText = j['error']
            } else {
                TokenStore.settings = j['settings']
                TokenStore.nodesList = j['nodes']

                TokenStore.messenger = _.cloneDeep(TokenStore.settings[KEY_MESSENGER])
                delete TokenStore.settings[KEY_MESSENGER]
                TokenStore.original.settings = _.cloneDeep(TokenStore.settings)
                TokenStore.original.nodesList = _.cloneDeep(TokenStore.nodesList)
            }
        } finally {
            TokenStore.loading = false
        }
    }

    restoreOriginalNodes() {
        TokenStore.nodesList = _.cloneDeep(TokenStore.original.nodesList)
    }

    restoreOriginalSettings() {
        TokenStore.settings = _.cloneDeep(TokenStore.original.settings)
    }

    async _writeSettings() {
        TokenStore.loading = true
        try {
            TokenStore.settings[KEY_MESSENGER] = TokenStore.messenger
            const settings = {
                settings: TokenStore.settings,
                nodes: TokenStore.nodesList,
            }
            console.log(settings)
            const response = await axios.post(this.settingsUrl(), settings)
            const j = response.data
            if (j['error']) {
                TokenStore.isError = true
                TokenStore.errorText = j['error']
            }
        } finally {
            TokenStore.loading = false
        }
    }

    async saveSettings() {
        try {
            await this._writeSettings()
            await this.readSettings()
        } catch (e) {
            return false
        }
        return true
    }

    async revokeLink() {
        TokenStore.loading = true
        try {
            const response = await axios.delete(this.settingsUrl())
            const j = response.data
            if (j['error']) {
                TokenStore.isError = true
                TokenStore.errorText = j['error']
            }
        } finally {
            this.purgeData()
            TokenStore.loading = false
        }
    }

    purgeData() {
        Object.assign(TokenStore, tokenStoreInitialState())
    }

    setToken(token) {
        TokenStore.token = token
    }
}
