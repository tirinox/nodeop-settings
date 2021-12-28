<template>
    <div>
        <v-row>
            <v-col>
                <h1>Alerts setup</h1>
                <v-switch v-model="allPaused" inset>
                    <template v-slot:label>
                        All paused
                    </template>
                </v-switch>
                <p>
                    <small>If you want, you can temporary pause all kinds of Node notifications without disabling them or removing nodes from the list.</small>
                </p>

                <v-divider></v-divider>

                <v-switch v-model="types.churning.enabled" inset>
                    <template v-slot:label>Churning</template>
                </v-switch>

                <v-switch v-model="types.newVersion.enabled" inset>
                    <template v-slot:label>New version checks</template>
                </v-switch>

                <v-switch v-model="types.version.enabled" inset>
                    <template v-slot:label>Your node upgraded its version</template>
                </v-switch>

                <v-divider></v-divider>

                <v-switch v-model="types.slashPoints.enabled" inset>
                    <template v-slot:label>Slash point accrual</template>
                </v-switch>

                <p>Slash points threshold:</p>
                <v-slider
                    max="5000"
                    min="1"
                    v-model="types.slashPoints.threshold"
                >
                </v-slider>
                <p>Current value: <code>{{ types.slashPoints.threshold }}</code> slash pts.</p>

                <v-divider></v-divider>

                <v-switch v-model="types.ipAddress.enabled" inset>
                    <template v-slot:label>IP Address change</template>
                </v-switch>

                <v-switch v-model="types.serviceOnline.enabled" inset>
                    <template v-slot:label>Service online/offline</template>
                </v-switch>

            </v-col>
        </v-row>

        <code>{{ JSON.stringify(this.$data, null, 4)}}</code>

    </div>
</template>

<script>
export default {
    name: "AlertsPage",
    data() {
        return {
            allPaused: false,
            types: {
                ipAddress: {enabled: false},
                bond: {enabled: false},
                chainHeight: {
                    enabled: false,
                    lag: 600,
                },
                slashPoints: {
                    enabled: false,
                    threshold: 10,
                    time: 60,
                },
                serviceOnline: {
                    enabled: false,
                    time: 300,
                },
                transactions: {
                    enabled: false,
                },
                churning: {
                    enabled: false,
                },
                version: {
                    enabled: false,
                },
                newVersion: {
                    enabled: false,
                }
            }
        }
    },
}
</script>

<style scoped>

</style>