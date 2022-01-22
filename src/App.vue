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
                    <span v-if="isAnythingUpdated">[Unsaved]</span>
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
                    <v-list-item to="/" link>
                        Start here
                    </v-list-item>
                    <v-list-item to="/select/nodes" link :disabled="!validConnection">
                        Watchlist
                        <v-icon small class="ml-1" v-if="isNodeListUpdated">mdi-asterisk</v-icon>
                    </v-list-item>
                    <v-list-item to="/alerts" link :disabled="!validConnection">
                        Alerts
                        <v-icon small class="ml-1" v-if="isSettingsUpdated">mdi-asterisk</v-icon>
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
import {APIConnector, SettingsStorageMixin} from "./service/api";

export default {
    components: {ThemeButton},
    mixins: [SettingsStorageMixin],
    data() {
        return {
            drawer: true,
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
    },
    mounted() {
        document.title = 'NodeOp setup'
        this.loadToken().then()
    }
}
</script>

