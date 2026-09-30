<template>
    <div>
        <h1 class="text-display-medium mt-2 mb-6">Welcome to the NodeOp tool setup</h1>

        <div v-if="isTokenLoading" class="text-center py-10">
            <v-progress-circular :size="50" color="amber" indeterminate/>
        </div>

        <div v-else-if="validConnection" class="d-flex flex-column ga-4">
            <p class="text-body-large">
                Here you can set up personal notifications about the status of the nodes you are interested in.
            </p>

            <v-alert type="info" variant="tonal" title="You are currently configuring:">
                <div class="text-headline-small mt-1">
                    {{ capitalizeFirstLetter(messengerInfo.platform) }}
                    (channel: <strong>#{{ messengerInfo.name }}</strong>,
                    user: <strong>{{ messengerInfo.username }}</strong>)
                </div>
            </v-alert>

            <v-row>
                <v-col cols="12" md="6">
                    <v-card variant="outlined" class="h-100">
                        <v-card-item prepend-icon="mdi-numeric-1-circle" title="Pick your nodes"/>
                        <v-card-text>
                            First, go to the "Watchlist" tab to select the desired nodes from the list.
                        </v-card-text>
                        <v-card-actions>
                            <v-btn to="/select/nodes" color="primary" variant="flat" prepend-icon="mdi-eye-settings-outline">
                                Watchlist
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card variant="outlined" class="h-100">
                        <v-card-item prepend-icon="mdi-numeric-2-circle" title="Tune the alerts"/>
                        <v-card-text>
                            Then, go to the "Alerts" tab and configure the types of notifications and their settings.
                        </v-card-text>
                        <v-card-actions>
                            <v-btn to="/alerts" color="primary" variant="flat" prepend-icon="mdi-comment-alert-outline">
                                Configure alerts
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>

            <v-card variant="tonal" color="error">
                <v-card-item prepend-icon="mdi-link-off" title="Revoke this link"/>
                <v-card-text>
                    If you no longer need this link or if you have a suspicion of leaking the link to unwanted persons,
                    you can invalidate it. Your settings will still not be affected. You can always create a new link
                    from the messenger.
                </v-card-text>
                <v-card-actions>
                    <v-btn color="error" variant="flat" prepend-icon="mdi-cancel" @click="confirmRevokeDialog = true">
                        Revoke the link
                    </v-btn>
                </v-card-actions>
            </v-card>
        </div>

        <v-alert v-else type="error" variant="tonal" border="start" title="No valid setup link">
            <p class="mt-1">
                The token is <strong>missing</strong> or it has <strong>expired</strong>.<br>
                Please generate a new link using THORChain Monitoring Bot inside your favorite messenger
                (Telegram/Slack/Discord).
            </p>

            <div v-if="tokenErrorText" class="my-2">Error: <code>{{ tokenErrorText }}</code></div>

            <div class="d-flex flex-wrap ga-2 mt-3">
                <v-btn :href="URL_TELEGRAM" target="_blank" rel="noopener" prepend-icon="mdi-send" variant="flat">
                    Telegram bot
                </v-btn>
                <v-btn :href="URL_SLACK" target="_blank" rel="noopener" prepend-icon="mdi-slack" variant="flat">
                    Slack bot
                </v-btn>
                <v-btn disabled prepend-icon="mdi-discord" variant="flat">
                    Discord bot (Soon!)
                </v-btn>
            </div>
        </v-alert>

        <DialogConfirmRevokeLink v-model="confirmRevokeDialog" @confirmed="revokeLink"/>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import DialogConfirmRevokeLink from '@/components/DialogConfirmRevokeLink.vue'
import {isTokenLoading, messengerInfo, revokeLink, tokenErrorText, validConnection} from '@/service/api'
import {capitalizeFirstLetter} from '@/service/utils'

const URL_SLACK = 'https://slack.com/oauth/v2/authorize?client_id=2687560270260.2682403425669&scope=channels:history,chat:write,commands,im:history,incoming-webhook,reactions:write,users:read,users.profile:read&user_scope='
const URL_TELEGRAM = 'https://t.me/thor_infobot'

const confirmRevokeDialog = ref(false)
</script>
