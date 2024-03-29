<template>
    <div>
        <v-row>
            <v-col>
                <div class="float-end" v-if="isSettingsUpdated">
                    <v-btn color="primary" large class="mx-2" @click="actionSave">Save</v-btn>
                    <v-btn color="secondary" large class="mx-2" @click="actionReset">Reset</v-btn>
                </div>

                <div class="text-h4">Alerts setup</div>
                <v-switch v-model="allPaused" inset color="warning">
                    <template v-slot:label>
                        All paused
                    </template>
                </v-switch>

                <p>
                    If you wish, you can temporarily pause
                    all types of notifications without disabling individual items or clearing the tracking list.
                </p>

                <v-divider></v-divider>

                <div v-show="isSlack">
                    <v-switch v-model="generalAlertsOn" inset>
                        <template v-slot:label>
                            General Alerts 🆕
                            <PausedLabel v-if="allPaused"/>
                        </template>
                    </v-switch>

                    <p>🆕 General alerts include price updates, large transactions, and daily summaries of statistics.
                        Just like in the Telegram channel.</p>

                    <v-divider></v-divider>
                </div>

                <v-switch v-model="churningOn" inset>
                    <template v-slot:label>
                        Churning
                        <PausedLabel v-if="allPaused"/>
                    </template>
                </v-switch>

                <p>You will receive a notification when your node churned in or out the active validator set.</p>

                <v-divider></v-divider>

                <v-switch v-model="newVersionOn" inset>
                    <template v-slot:label>New version checks
                        <PausedLabel v-if="allPaused"/>
                    </template>
                </v-switch>

                <p>
                    You will be notified if a new version of the software is available on the network.
                </p>

                <v-switch v-model="myVersionOn" inset>
                    <template v-slot:label>Your node upgraded its version
                        <PausedLabel v-if="allPaused"/>
                    </template>
                </v-switch>

                <p>
                    Stay informed when the nodes change their software version
                </p>

                <v-divider></v-divider>

                <v-switch v-model="slashOn" inset>
                    <template v-slot:label>Slash point accrual
                        <PausedLabel v-if="allPaused"/>
                    </template>
                </v-switch>

                <p>
                    Slash points threshold:
                    <code>{{ slashThreshold }}</code> slash pts.
                </p>

                <v-slider
                    max="10000"
                    min="1"
                    v-model="slashThreshold_raw"
                ></v-slider>

                <p>
                    Time interval:
                    <code>{{ slashPeriod | secondsToConvenientString }}</code>.
                </p>

                <v-slider
                    max="10000"
                    min="1"
                    v-model="slashPeriod_raw"
                ></v-slider>

                <p>
                    You will get a notification if your node has incurred more than
                    <em>{{ slashThreshold }} slash pts</em> in the last
                    <em>{{ slashPeriod | secondsToConvenientString }}</em>.
                </p>

                <v-divider></v-divider>

                <v-switch v-model="offlineOn" inset>
                    <template v-slot:label>Service online/offline
                        <PausedLabel v-if="allPaused"/>
                    </template>
                </v-switch>

                <p>
                    There will be an alert if any of the services stops responding for a period of time.
                    <strong>Bifrost</strong> and <strong>RPC</strong> are supported.
                </p>

                <v-slider
                    max="10000"
                    min="1"
                    v-model="offlineInterval_raw"
                ></v-slider>

                <p>
                    Current interval is equals <em>{{ offlineInterval | secondsToConvenientString }}</em>.
                </p>

                <v-divider></v-divider>

                <v-switch v-model="heightOn" inset>
                    <template v-slot:label>Chain height stuck notification
                        <PausedLabel v-if="allPaused"/>
                    </template>
                </v-switch>

                <p>
                    Please select a time interval for the notification threshold.
                    If your node does not scan blocks longer than this interval,
                    you will get a notification about it.
                    If the threshold interval is less than the typical block time for the blockchain,
                    it will be increased to 150% of the typical time (for instance 15 minutes for BTC).
                </p>

                <v-slider
                    max="10000"
                    min="1"
                    v-model="heightInterval_raw"
                ></v-slider>

                <p>
                    Current interval is equals <em>{{ heightInterval | secondsToConvenientString }}</em>.
                </p>


                <v-divider></v-divider>

                <v-switch v-model="addressIPOn" inset>
                    <template v-slot:label>IP Address change
                        <PausedLabel v-if="allPaused"/>
                    </template>
                </v-switch>

                <p>
                    In case the node changes its IP address.
                </p>

                <v-divider></v-divider>

                <v-switch v-model="bondOn" inset>
                    <template v-slot:label>Bond change
                        <PausedLabel v-if="allPaused"/>
                    </template>
                </v-switch>

                <p>
                    If the bond size of the node changes.
                </p>

                <v-divider></v-divider>

                <div class="float-end pt-2" v-if="isSettingsUpdated">
                    <v-btn color="primary" large class="mx-2" @click="actionSave">Save</v-btn>
                    <v-btn color="secondary" large class="mx-2" @click="actionReset">Reset</v-btn>
                </div>

                <v-divider></v-divider>

                <p class="my-6">
                    <small>
                        If you have ideas for new types of notifications or want to report bugs, write to my Discord:

                        <code>{{ myDiscord }}</code>
                        <CopyButton :content="myDiscord"></CopyButton>
                    </small>
                </p>

            </v-col>
        </v-row>
    </div>
</template>

<script>

import {APIConnector, SettingsStorageMixin, TokenStore} from "../service/api";
import {eventBus, EVENTS} from "../service/bus";
import {defaultBool, defaultNumber, secondsToConvenientString, simpleClone, SliderConverter} from "../service/utils";
import PausedLabel from "../components/PausedLabel";
import CopyButton from "../components/CopyButton";

const HOUR = 3600
const STD_INTERVALS = {
    '2m': 120,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
    '60m': 3600,
    '2h': 7200,
    '6h': 21600,
    '12h': 43200,
    '24h': 86400,
    '3d': 259200
}
const STD_INTERVALS_ONLY_SEC = Object.values(STD_INTERVALS)

export default {
    name: "AlertsPage",
    components: {CopyButton, PausedLabel},
    mixins: [SettingsStorageMixin],
    data() {
        return {
            allPaused: false,
            slashOn: true,
            slashThreshold: 100,
            slashThreshold_raw: 100,
            slashPeriod: 600,
            slashPeriod_raw: 600,
            newVersionOn: true,
            myVersionOn: true,
            offlineOn: true,
            offlineInterval: 1200,
            offlineInterval_raw: 1200,
            churningOn: true,
            bondOn: true,
            heightOn: true,
            heightInterval: 2400,
            heightInterval_raw: 2400,
            addressIPOn: true,

            generalAlertsOn: false,

            myDiscord: 'Old1#0517'
        }
    },
    computed: {
        convertedSettings() {
            return {
                "nop:pause_all:on": this.allPaused,
                "nop:slash:on": this.slashOn,
                "nop:slash:threshold": this.sliderSlashThreshold.toExternal(this.slashThreshold_raw),
                "nop:slash:period": this.slider3Day.toExternal(this.slashPeriod_raw, STD_INTERVALS_ONLY_SEC),
                "nop:new_v:on": this.newVersionOn,
                "nop:version:on": this.myVersionOn,
                "nop:offline:on": this.offlineOn,
                "nop:offline:interval": this.slider3Day.toExternal(this.offlineInterval_raw),
                "nop:churning:on": this.churningOn,
                "nop:bond:on": this.bondOn,
                "nop:height:on": this.heightOn,
                "nop:height:interval": this.slider3Day.toExternal(this.heightInterval_raw),
                "nop:ip:on": this.addressIPOn,
                "gen:alerts": this.generalAlertsOn,
            }
        }
    },
    filters: {
        secondsToConvenientString
    },
    methods: {
        convertSlidersToInternal() {
            this.slashThreshold_raw = this.sliderSlashThreshold.toInternal(this.slashThreshold)
            this.slashPeriod_raw = this.slider3Day.toInternal(this.slashPeriod, STD_INTERVALS_ONLY_SEC)
            this.offlineInterval_raw = this.slider3Day.toInternal(this.offlineInterval)
            this.heightInterval_raw = this.slider3Day.toInternal(this.heightInterval)
        },

        convertSlidersToExternal() {
            this.slashThreshold = this.sliderSlashThreshold.toExternal(this.slashThreshold_raw)
            this.slashPeriod = this.slider3Day.toExternal(this.slashPeriod_raw, STD_INTERVALS_ONLY_SEC)
            this.offlineInterval = this.slider3Day.toExternal(this.offlineInterval_raw)
            this.heightInterval = this.slider3Day.toExternal(this.heightInterval_raw)
        },

        onLoadedSettingsFromServer() {
            const store = TokenStore.settings
            if (!store) {
                console.warn('No settings store..')
                return
            }
            console.info('Loading settings to Alerts form: ', simpleClone(store))

            this.allPaused = defaultBool(store["nop:pause_all:on"], false)

            this.slashOn = defaultBool(store["nop:slash:on"], true)
            this.slashThreshold = defaultNumber(store["nop:slash:threshold"], 100)

            this.slashPeriod = defaultNumber(store["nop:slash:period"], 2 * HOUR)

            this.newVersionOn = defaultBool(store["nop:new_v:on"], true)
            this.myVersionOn = defaultBool(store["nop:version:on"], true)

            this.offlineOn = defaultBool(store["nop:offline:on"], true)
            this.offlineInterval = defaultNumber(store["nop:offline:interval"], 2 * HOUR)

            this.churningOn = defaultBool(store["nop:churning:on"], true)

            this.bondOn = defaultBool(store["nop:bond:on"], true)

            this.heightOn = defaultBool(store["nop:height:on"], true)
            this.heightInterval = defaultNumber(store["nop:height:interval"], HOUR)

            this.addressIPOn = defaultBool(store["nop:ip:on"], true)
            this.generalAlertsOn = defaultBool(store["gen:alerts"], false)

            this.convertSlidersToInternal()
        },

        actionReset() {
            const api = new APIConnector()
            api.restoreOriginalSettings()
        },

        async actionSave() {
            const api = new APIConnector()
            const result = await api.saveSettings()
            eventBus.$emit(EVENTS.PRESENT_SAVE_RESULT, {result, kind: 'alerts'})
        },
    },
    watch: {
        convertedSettings(newConvertedSettings) {
            this.convertSlidersToExternal()

            TokenStore.settings = newConvertedSettings
        }
    },
    beforeCreate() {
        this.slider3Day = new SliderConverter(60, 3 * HOUR * 24, 3, true)
        this.sliderSlashThreshold = new SliderConverter(1, 20000, 3, true)
    },
    created() {
        eventBus.$on(EVENTS.ON_SETTINGS_LOADED, this.onLoadedSettingsFromServer)
        this.onLoadedSettingsFromServer()
    },
    beforeDestroy() {
        eventBus.$off(EVENTS.ON_SETTINGS_LOADED, this.onLoadedSettingsFromServer)
    },
}
</script>

<style scoped>

</style>