import axios from "axios";
import Vue from "vue";

const DEV_URL = 'http://127.0.0.1:8088'
const PROD_RUL = 'https://settings.thornode.org'

export const TokenStore = Vue.observable({
    token: '',
    messenger: 'Unknown',
    channelId: '',
    loading: false,
    isError: false,
    errorText: '',
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
            }
        } finally {
            TokenStore.loading = false
        }
    }

    setToken(token) {
        TokenStore.token = token
    }
}
