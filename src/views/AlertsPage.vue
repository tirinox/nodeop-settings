<template>
    <div>
        <div class="d-flex align-center flex-wrap ga-3 mb-4">
            <h1 class="text-headline-large flex-grow-1">Alerts setup</h1>
            <SaveResetButtons v-if="isSettingsUpdated" @save="actionSave" @reset="restoreOriginalSettings"/>
        </div>

        <v-card variant="tonal" :color="allPaused ? 'warning' : undefined" class="mb-6">
            <v-card-text>
                <v-switch v-model="allPaused" color="warning">
                    <template #label>
                        <span class="text-title-medium">All paused</span>
                    </template>
                </v-switch>
                <p class="text-body-medium mt-1">
                    If you wish, you can temporarily pause
                    all types of notifications without disabling individual items or clearing the tracking list.
                </p>
            </v-card-text>
        </v-card>

        <v-card variant="outlined">
            <v-card-text class="py-0">
                <template v-if="isSlack">
                    <AlertToggle v-model="generalAlertsOn" title="General Alerts 🆕" :paused="allPaused">
                        🆕 General alerts include price updates, large transactions, and daily summaries of statistics.
                        Just like in the Telegram channel.
                    </AlertToggle>
                    <v-divider/>
                </template>

                <AlertToggle v-model="churningOn" title="Churning" :paused="allPaused">
                    You will receive a notification when your node churned in or out the active validator set.
                </AlertToggle>

                <v-divider/>

                <AlertToggle v-model="newVersionOn" title="New version checks" :paused="allPaused">
                    You will be notified if a new version of the software is available on the network.
                </AlertToggle>

                <AlertToggle v-model="myVersionOn" title="Your node upgraded its version" :paused="allPaused">
                    Stay informed when the nodes change their software version
                </AlertToggle>

                <v-divider/>

                <AlertToggle v-model="slashOn" title="Slash point accrual" :paused="allPaused">
                    <p class="mt-2">
                        Slash points threshold:
                        <code>{{ slashThreshold }}</code> slash pts.
                    </p>
                    <v-slider v-model="slashThresholdPos" :min="1" :max="SLIDER_MAX" :step="1"/>

                    <p>
                        Time interval:
                        <code>{{ secondsToConvenientString(slashPeriod) }}</code>.
                    </p>
                    <v-slider v-model="slashPeriodPos" :min="1" :max="SLIDER_MAX" :step="1"/>

                    <p>
                        You will get a notification if your node has incurred more than
                        <em>{{ slashThreshold }} slash pts</em> in the last
                        <em>{{ secondsToConvenientString(slashPeriod) }}</em>.
                    </p>
                </AlertToggle>

                <v-divider/>

                <AlertToggle v-model="offlineOn" title="Service online/offline" :paused="allPaused">
                    <p>
                        There will be an alert if any of the services stops responding for a period of time.
                        <strong>Bifrost</strong> and <strong>RPC</strong> are supported.
                    </p>
                    <v-slider v-model="offlineIntervalPos" :min="1" :max="SLIDER_MAX" :step="1"/>
                    <p>
                        Current interval is equals <em>{{ secondsToConvenientString(offlineInterval) }}</em>.
                    </p>
                </AlertToggle>

                <v-divider/>

                <AlertToggle v-model="heightOn" title="Chain height stuck notification" :paused="allPaused">
                    <p>
                        Please select a time interval for the notification threshold.
                        If your node does not scan blocks longer than this interval,
                        you will get a notification about it.
                        If the threshold interval is less than the typical block time for the blockchain,
                        it will be increased to 150% of the typical time (for instance 15 minutes for BTC).
                    </p>
                    <v-slider v-model="heightIntervalPos" :min="1" :max="SLIDER_MAX" :step="1"/>
                    <p>
                        Current interval is equals <em>{{ secondsToConvenientString(heightInterval) }}</em>.
                    </p>
                </AlertToggle>

                <v-divider/>

                <AlertToggle v-model="addressIPOn" title="IP Address change" :paused="allPaused">
                    In case the node changes its IP address.
                </AlertToggle>

                <v-divider/>

                <AlertToggle v-model="bondOn" title="Bond change" :paused="allPaused">
                    If the bond size of the node changes.
                </AlertToggle>
            </v-card-text>
        </v-card>

        <div v-if="isSettingsUpdated" class="d-flex justify-end mt-4">
            <SaveResetButtons @save="actionSave" @reset="restoreOriginalSettings"/>
        </div>

        <p class="my-6 text-body-small text-medium-emphasis">
            If you have ideas for new types of notifications or want to report bugs, write to my Discord:
            <code>{{ MY_DISCORD }}</code>
            <CopyButton :content="MY_DISCORD"/>
        </p>
    </div>
</template>

<script setup>
import {computed} from 'vue'
import AlertToggle from '@/components/AlertToggle.vue'
import CopyButton from '@/components/CopyButton.vue'
import SaveResetButtons from '@/components/SaveResetButtons.vue'
import {isSettingsUpdated, isSlack, restoreOriginalSettings, saveSettings, store} from '@/service/api'
import {DAY, readSetting, STD_INTERVALS} from '@/service/alertSettings'
import {notifySaveResult} from '@/service/notify'
import {secondsToConvenientString, SliderConverter} from '@/service/utils'

const MY_DISCORD = 'Old1#0517'
const SLIDER_MAX = SliderConverter.RANGE

const slider3Day = new SliderConverter(60, 3 * DAY, 3, true)
const sliderSlashThreshold = new SliderConverter(1, 20000, 3, true)

// Two-way binding straight to the shared store, so load/reset/save need no syncing
function setting(key) {
    return computed({
        get: () => readSetting(store.settings, key),
        set: value => {
            store.settings[key] = value
        },
    })
}

// Non-linear slider position for a numeric setting
function sliderPosition(key, converter, stickTo) {
    return computed({
        get: () => converter.toInternal(readSetting(store.settings, key), stickTo),
        set: position => {
            store.settings[key] = converter.toExternal(position, stickTo)
        },
    })
}

const allPaused = setting('nop:pause_all:on')
const generalAlertsOn = setting('gen:alerts')
const churningOn = setting('nop:churning:on')
const newVersionOn = setting('nop:new_v:on')
const myVersionOn = setting('nop:version:on')
const bondOn = setting('nop:bond:on')
const addressIPOn = setting('nop:ip:on')

const slashOn = setting('nop:slash:on')
const slashThreshold = setting('nop:slash:threshold')
const slashThresholdPos = sliderPosition('nop:slash:threshold', sliderSlashThreshold)
const slashPeriod = setting('nop:slash:period')
const slashPeriodPos = sliderPosition('nop:slash:period', slider3Day, STD_INTERVALS)

const offlineOn = setting('nop:offline:on')
const offlineInterval = setting('nop:offline:interval')
const offlineIntervalPos = sliderPosition('nop:offline:interval', slider3Day)

const heightOn = setting('nop:height:on')
const heightInterval = setting('nop:height:interval')
const heightIntervalPos = sliderPosition('nop:height:interval', slider3Day)

async function actionSave() {
    notifySaveResult(await saveSettings(), 'Your preferences are saved.')
}
</script>
