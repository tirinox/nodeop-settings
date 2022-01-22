import axios from "axios";
import Vue from "vue";
import _ from "lodash";

const DEV_URL = 'http://127.0.0.1:8088'
const PROD_RUL = 'https://settings.thornode.org'

export const TokenStore = Vue.observable({
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
    }
})

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
            return !_.isEqual(TokenStore.settings, TokenStore.original.settings)
        },
        isNodeListUpdated() {
            return !_.isEqual(TokenStore.nodesList, TokenStore.original.nodesList)
        },
        isAnythingUpdated() {
            return this.isSettingsUpdated || this.isNodeListUpdated
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
                TokenStore.original.settings = _.cloneDeep(TokenStore.settings)
                TokenStore.original.nodesList = _.cloneDeep(TokenStore.nodesList)
                TokenStore.messenger = TokenStore.settings['_messenger']
            }
        } finally {
            TokenStore.loading = false
        }
        console.log(TokenStore)
    }

    async writeSettings() {
        TokenStore.loading = true
        try {
            const settings = {
                settings: TokenStore.settings,
                nodes: TokenStore.nodes
            }
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
            TokenStore.loading = false
        }
    }

    setToken(token) {
        TokenStore.token = token
    }
}
