<template>
    <div class="py-4">
        <v-switch v-model="enabled">
            <template #label>
                <span class="text-title-medium">{{ title }}</span>
                <PausedLabel v-if="paused"/>
            </template>
        </v-switch>
        <div class="text-body-medium text-medium-emphasis alert-body" :class="{'text-disabled': !enabled}">
            <slot/>
        </div>
    </div>
</template>

<script setup>
import PausedLabel from './PausedLabel.vue'

defineProps({
    title: {type: String, required: true},
    paused: {type: Boolean, default: false},
})

const enabled = defineModel({type: Boolean, default: false})
</script>

<style scoped>
.alert-body {
    /* align with the switch label */
    padding-inline-start: 4px;
}
</style>
