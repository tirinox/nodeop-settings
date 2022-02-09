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
                    If you want, you can temporary pause all kinds of Node notifications
                    without disabling them or removing nodes from the list.
                </p>

                <v-divider></v-divider>

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
                    We will offer you an update to the new version if one becomes available online.
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
                    it will be increased to 150% of the typical time (15 minutes for BTC).
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
                    If the bond size of a node changes.
                </p>

                <v-divider></v-divider>

                <div class="float-end pt-2" v-if="isSettingsUpdated">
                    <v-btn color="primary" large class="mx-2" @click="actionSave">Save</v-btn>
                    <v-btn color="secondary" large class="mx-2" @click="actionReset">Reset</v-btn>
                </div>

                <v-divider></v-divider>

                <p class="my-6">
                    <small>
                        If you have ideas for new types of notifications or want to report bugs, write to Discord:

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
import {defaultBool, defaultNumber, secondsToConvenientString, SliderConverter} from "../service/utils";
import PausedLabel from "../components/PausedLabel";
import CopyButton from "../components/CopyButton";

const HOUR = 3600

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

            myDiscord: 'Old1#0517'
        }
    },
    computed: {
        convertedSettings() {
            return {
                "nop:pause_all:on": this.allPaused,
                "nop:slash:on": this.slashOn,
                "nop:slash:threshold": this.sliderSlashThreshold.toExternal(this.slashThreshold_raw),
                "nop:slash:period": this.slider2Day.toExternal(this.slashPeriod_raw),
                "nop:new_v:on": this.newVersionOn,
                "nop:version:on": this.myVersionOn,
                "nop:offline:on": this.offlineOn,
                "nop:offline:interval": this.slider2Day.toExternal(this.offlineInterval_raw),
                "nop:churning:on": this.churningOn,
                "nop:bond:on": this.bondOn,
                "nop:height:on": this.heightOn,
                "nop:height:interval": this.slider2Day.toExternal(this.heightInterval_raw),
                "nop:ip:on": this.addressIPOn,
            }
        }
    },
    filters: {
        secondsToConvenientString
    },
    methods: {
        convertSlidersToInternal() {
            this.slashThreshold_raw = this.sliderSlashThreshold.toInternal(this.slashThreshold)
            this.slashPeriod_raw = this.slider2Day.toInternal(this.slashPeriod)
            this.offlineInterval_raw = this.slider2Day.toInternal(this.offlineInterval)
            this.heightInterval_raw = this.slider2Day.toInternal(this.heightInterval)
        },

        convertSlidersToExternal() {
            this.slashThreshold = this.sliderSlashThreshold.toExternal(this.slashThreshold_raw)
            this.slashPeriod = this.slider2Day.toExternal(this.slashPeriod_raw)
            this.offlineInterval = this.slider2Day.toExternal(this.offlineInterval_raw)
            this.heightInterval = this.slider2Day.toExternal(this.heightInterval_raw)
        },

        onLoadedSettingsFromServer() {
            const store = TokenStore.settings
            console.info('Loading settings to Alerts form: ', store)

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
        this.slider2Day = new SliderConverter(60, 2 * 60 * 60 * 24, 3, true)
        this.sliderSlashThreshold = new SliderConverter(1, 20000, 3, true)

        eventBus.$on(EVENTS.ON_SETTINGS_LOADED, this.onLoadedSettingsFromServer)
    },
    created() {
        this.onLoadedSettingsFromServer()
    },
    beforeDestroy() {
        // eventBus.$off(EVENTS.ON_SETTINGS_LOADED, this.onLoadedSettingsFromServer)
    },
}
</script>

<style scoped>

</style>