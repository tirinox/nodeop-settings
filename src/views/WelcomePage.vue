<template>
    <div>
        <div class="text-h4 mt-4">Welcome to the NodeOp tool setup</div>

        <div class="my-2" v-if="validConnection">
            <p>
                Here you can set up personal notifications about the status of the nodes you are interested in.
            </p>

            <div class="my-1">
                <p>You are currently configuring:</p>
                <div class="text-h5">{{ messengerInfo.platform }}
                    (@{{ messengerInfo.username }}, {{ messengerInfo.name }})
                </div>
            </div>

            <p>
                First, go to the Watchlist tab to select the nodes from the list.
            </p>
            <v-btn link to="/select/nodes">
                <v-icon>mdi-eye-settings-outline</v-icon>
                Watchlist
            </v-btn>
            <p class="mt-4">
                Then, go to the Alerts tab and configure the types of notifications and their settings.
            </p>
            <v-btn link to="/alerts">
                <v-icon>mdi-comment-alert-outline</v-icon>
                Configure alerts
            </v-btn>
            <p class="mt-4">
                If you no longer need this link or if you have a suspicion of leaking the link to unwanted persons,
                you can invalidate it. Your settings will still not be affected.
            </p>
            <v-btn color="warning" @click="confirmRevokeDialog = true">
                <v-icon>mdi-cancel</v-icon>
                Revoke the link
            </v-btn>
        </div>

        <v-alert
            class="mt-4"
            dense
            border="left"
            type="error"
            v-if="!validConnection"
        >
            The token is <strong>missing</strong> or it has <strong>expired</strong>.<br>
            Please generate a new link using THORChain Monitoring Bot inside your favorite messenger
            (Telegram/Slack/Discord).

            <div v-if="tokenErrorText" class="my-2">Error: <code>{{ tokenErrorText }}</code></div>

            <div class="my-3">
                <v-btn class="mx-2" link :href="this.URL_TELEGRAM" target="_blank">
                    <v-icon class="mr-1">mdi-send</v-icon>
                    Telegram bot
                </v-btn>
                <v-btn class="mx-2" link :href="this.URL_SLACK" target="_blank">
                    <v-icon class="mr-1">mdi-slack</v-icon>
                    Slack bot
                </v-btn>
                <v-btn class="mx-2" disabled>
                    <v-icon class="mr-1">mdi-discord</v-icon>
                    Discord bot (Soon!)
                </v-btn>
            </div>

        </v-alert>
        <div class="text-center" v-if="isTokenLoading">
            <v-progress-circular
                :size="50"
                color="amber"
                indeterminate
            ></v-progress-circular>
        </div>

        <DialogConfirmRevokeLink v-model="confirmRevokeDialog" @confirmed="onClickRevoke"></DialogConfirmRevokeLink>
    </div>
</template>

<script>
import {APIConnector, SettingsStorageMixin} from "../service/api";
import {eventBus, EVENTS} from "../service/bus";
import DialogConfirmRevokeLink from "../components/DialogConfirmRevokeLink";

export default {
    name: "WelcomePage",
    components: {DialogConfirmRevokeLink},
    mixins: [SettingsStorageMixin],
    computed: {
        envName() {
            return process.env.NODE_ENV
        },
    },
    data() {
        return {
            confirmRevokeDialog: false,
        }
    },
    created() {
        this.URL_SLACK = 'https://slack.com/oauth/v2/authorize?client_id=2687560270260.2682403425669&scope=channels:history,chat:write,commands,im:history,incoming-webhook,reactions:write,users:read,users.profile:read&user_scope='
        this.URL_TELEGRAM = 'https://t.me/thor_infobot'
        this.URL_DISCORD = 'None'
    },
    methods: {
        async onClickRevoke() {
            const api = new APIConnector()
            const result = await api.revokeLink()
            eventBus.$emit(EVENTS.ON_LINK_REVOKED, result)
        }
    }
}
</script>

<style scoped>

</style>