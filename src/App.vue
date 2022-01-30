<template>
    <div id="app">
        <v-app>
            <v-snackbar
                :timeout="2000"
                :value="true"
                color="success accent-4"
                elevation="24"
                v-model="savedAlertActive"
            >
                Your watchlist saved.
            </v-snackbar>

            <v-snackbar
                :timeout="2000"
                :value="true"
                color="error"
                elevation="24"
                v-model="errorAlertActive"
            >
                Error saving the settings. Check your connection.
            </v-snackbar>

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
                    <span v-if="isAnythingUpdated">
                        <v-icon v-if="isNodeListUpdated">mdi-asterisk</v-icon>
                    </span>
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
import {eventBus, EVENTS} from "./service/bus";

export default {
    components: {ThemeButton},
    mixins: [SettingsStorageMixin],
    data() {
        return {
            drawer: true,
            savedAlertActive: false,
            errorAlertActive: false,
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
    },
    created() {
        const that = this
        window.onload = function () {
            window.addEventListener("beforeunload", function (e) {
                if (!that.isAnythingUpdated) {
                    return undefined;
                }

                const confirmationMessage = 'It looks like you have been editing something. '
                    + 'If you leave before saving, your changes will be lost.';

                (e || window.event).returnValue = confirmationMessage; //Gecko + IE
                return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
            })
        }
        eventBus.$on(EVENTS.PRESENT_SAVE_RESULT, (result) => {
            if(result) {
                this.savedAlertActive = true
            } else {
                this.errorAlertActive = true
            }
        })
    }
}
</script>

