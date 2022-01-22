import axios from "axios";
import Vue from "vue";

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
    loading: false,
    isError: false,
    errorText: '',
    settings: {},
})

export const TokenMixin = {
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
        }
    }
}

export class APIConnector {
    constructor() {
        this.url = process.env.NODE_ENV === 'development' ? DEV_URL : PROD_RUL
    }

    async readSettings() {
        TokenStore.loading = true
        try {
            const response = await axios.get(`${this.url}/api/settings/${TokenStore.token}`)
            const j = response.data
            if(j['error']) {
                TokenStore.isError = true
                TokenStore.errorText = j['error']
            } else {
                TokenStore.settings = j['settings']
                TokenStore.messenger = TokenStore.settings['_messenger']
            }
        } finally {
            TokenStore.loading = false
        }
        console.log(TokenStore)
    }

    setToken(token) {
        TokenStore.token = token
    }
}
