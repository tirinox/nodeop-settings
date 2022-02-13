import axios from "axios";
import Vue from "vue";
import _ from "lodash";
import {simpleClone} from "./utils";

const DEV_URL = 'http://127.0.0.1:8088'
const PROD_RUL = ''  // same domain

const LS_TOKEN_KEY = 'settingsToken'

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
        const t = TokenStore.token = this.locallySavedToken()
        if (t) {
            console.info('token = ', t)
        }
    }

    locallySavedToken() {
        return Vue.ls.get(LS_TOKEN_KEY, '')
    }

    saveTokenLocally() {
        Vue.ls.set(LS_TOKEN_KEY, TokenStore.token)
    }

    settingsUrl() {
        return `${this.url}/api/settings/${TokenStore.token}`
    }

    async readSettings() {
        const s = TokenStore
        s.loading = true

        try {
            const response = await axios.get(this.settingsUrl())
            const j = response.data
            if (response.status !== 200 || j['error']) {
                s.isError = true
                s.errorText = j['error']
            } else {
                s.settings = j['settings']
                s.nodesList = j['nodes']

                s.messenger = _.cloneDeep(s.settings[KEY_MESSENGER])
                if (!s.messenger) {
                    s.messenger = {
                        platform: 'Unknown_Platform',
                        name: 'NoName',
                        username: 'NoUserName',
                    }
                }

                delete s.settings[KEY_MESSENGER]
                s.original.settings = _.cloneDeep(s.settings)
                s.original.nodesList = _.cloneDeep(s.nodesList)

                console.debug('readSettings()', simpleClone(s))

                this.saveTokenLocally()
            }
        } catch (e) {
            console.error(e)
            s.isError = true
            s.errorText = 'network error'
        } finally {
            s.loading = false
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
        this.saveTokenLocally()
    }

    setToken(token) {
        TokenStore.token = token
    }
}
