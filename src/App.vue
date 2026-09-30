<template>
    <v-app>
        <v-snackbar
            v-model="toast.visible"
            :color="toast.color"
            :timeout="2500"
            location="bottom"
        >
            {{ toast.text }}
        </v-snackbar>

        <v-app-bar scroll-behavior="elevate" border="b" flat>
            <template #prepend>
                <v-app-bar-nav-icon v-if="mobile" @click="drawer = !drawer"/>
            </template>

            <v-app-bar-title>
                <div class="d-flex align-center ga-3">
                    <v-avatar size="36">
                        <img src="/android-chrome-192x192.png" alt="NodeOp logo" width="36" height="36">
                    </v-avatar>
                    <span class="text-truncate">NodeOp Tool settings</span>
                    <v-chip
                        v-if="isAnythingUpdated"
                        size="small"
                        color="warning"
                        variant="tonal"
                        prepend-icon="mdi-pencil"
                        class="d-none d-sm-flex"
                    >
                        Unsaved changes
                    </v-chip>
                </div>
            </v-app-bar-title>

            <template #append>
                <ThemeButton/>
            </template>
        </v-app-bar>

        <v-navigation-drawer
            v-model="drawer"
            :permanent="!mobile"
            :temporary="mobile"
            width="220"
        >
            <v-list nav density="comfortable" color="primary">
                <v-list-item to="/" exact prepend-icon="mdi-home-outline" title="Start here"/>
                <v-list-item
                    to="/select/nodes"
                    prepend-icon="mdi-eye-outline"
                    title="Watchlist"
                    :disabled="!validConnection"
                >
                    <template v-if="isNodeListUpdated" #append>
                        <v-icon size="x-small" color="warning">mdi-circle</v-icon>
                    </template>
                </v-list-item>
                <v-list-item
                    to="/alerts"
                    prepend-icon="mdi-bell-outline"
                    title="Alerts"
                    :disabled="!validConnection"
                >
                    <template v-if="isSettingsUpdated" #append>
                        <v-icon size="x-small" color="warning">mdi-circle</v-icon>
                    </template>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <v-container class="py-6" max-width="1400">
                <router-view/>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useDisplay} from 'vuetify'
import ThemeButton from '@/components/ThemeButton.vue'
import {
    isAnythingUpdated,
    isNodeListUpdated,
    isSettingsUpdated,
    readSettings,
    setToken,
    store,
    validConnection,
} from '@/service/api'
import {toast} from '@/service/notify'

const {mobile} = useDisplay()
const drawer = ref(!mobile.value)

watch(mobile, isMobile => {
    drawer.value = !isMobile
})

async function loadToken() {
    const token = new URLSearchParams(window.location.search).get('token')
    if (token) {
        setToken(token)
    }
    if (!store.token) {
        store.loading = false
        return
    }
    await readSettings()
}

function onBeforeUnload(e) {
    if (isAnythingUpdated.value) {
        // Modern browsers show their own generic "leave site?" message
        e.preventDefault()
        e.returnValue = ''
    }
}

onMounted(() => {
    window.addEventListener('beforeunload', onBeforeUnload)
    loadToken()
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>

<style>
code {
    font-size: 0.875em;
}
</style>
