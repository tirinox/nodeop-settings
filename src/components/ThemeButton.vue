<template>
    <v-tooltip :text="isDark ? 'Dark Mode Off' : 'Dark Mode On'" location="bottom">
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                :icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waxing-crescent'"
                :color="isDark ? 'yellow' : undefined"
                variant="text"
                @click="toggle"
            />
        </template>
    </v-tooltip>
</template>

<script setup>
import {computed} from 'vue'
import {useTheme} from 'vuetify'
import {lsSet} from '@/service/storage'
import {LS_THEME_KEY} from '@/plugins/vuetify'

const theme = useTheme()

const isDark = computed(() => theme.current.value.dark)

function toggle() {
    const nextDark = !isDark.value
    theme.change(nextDark ? 'dark' : 'light')
    lsSet(LS_THEME_KEY, nextDark)
}
</script>
