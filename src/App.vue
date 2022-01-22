<template>
    <div id="app">
        <v-app>
            <v-app-bar elevate-on-scroll
                       app
                       clipped-left
                       elevation="12"
            >
                <v-toolbar-title>
                    <v-avatar>
                        <img src="/android-chrome-512x512.png" alt="logo"/>
                    </v-avatar>

                    NodeOp Tool settings
                </v-toolbar-title>

                <v-spacer></v-spacer>

                <v-btn icon>
                    <ThemeButton></ThemeButton>
                </v-btn>

            </v-app-bar>

            <v-navigation-drawer
                app
                clipped
                permanent
                v-model="drawer"
                width="200"
            >
                <v-list>
                    <v-list-item v-for="item in menu_items" :key="item.id" :to="item.url" link
                                 :disabled="!isMenuEnabledId(item.id)">
                        {{ item.name }}
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>

            <v-main>
                <v-container>
                    <router-view></router-view>
                </v-container>
            </v-main>

        </v-app>
    </div>
</template>

<script>
import ThemeButton from "./components/ThemeButton";
import {APIConnector, TokenMixin} from "./service/api";

export default {
    components: {ThemeButton},
    mixins: [TokenMixin],
    data() {
        return {
            drawer: true,
            menu_items: [
                {
                    id: 0,
                    name: 'Start',
                    url: '/'
                },
                {
                    id: 1,
                    name: 'Watchlist',
                    url: '/select/nodes'
                },
                {
                    id: 2,
                    name: 'Alerts',
                    url: '/alerts'
                },
            ]
        }
    },
    methods: {
        async loadToken() {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token')
            const api = new APIConnector()
            api.setToken(token)
            await api.readSettings()
        },
        isMenuEnabledId(id) {
            return id === 0 || this.validConnection
        },
    },
    mounted() {
        document.title = 'NodeOp setup'
        this.loadToken().then()
    }
}
</script>

