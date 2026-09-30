<template>
    <v-list-item class="py-2" lines="two">
        <template #prepend>
            <v-avatar
                :color="statusColor"
                size="44"
                class="cursor-pointer mr-3"
                :title="`Copy ${node.node_address}`"
                @click="copy(node.node_address)"
            >
                <v-icon v-if="copied">mdi-check-circle-outline</v-icon>
                <span v-else class="text-label-medium font-weight-bold">{{ node.initials }}</span>
            </v-avatar>
        </template>

        <v-list-item-title class="d-flex align-center">
            <code class="text-truncate">{{ node.node_address }}</code>
            <CopyButton :content="node.node_address" class="ml-1 flex-shrink-0"/>
        </v-list-item-title>

        <v-list-item-subtitle class="d-flex align-center flex-wrap ga-2 mt-1">
            <v-chip :color="statusColor" size="x-small" label>
                {{ node.status }}<template v-if="node.version">&nbsp;v.{{ node.version }}</template>
            </v-chip>
            <span>ᚱ<strong>{{ millify(Number(node.bond_rune) || 0) }}</strong> bonded</span>
        </v-list-item-subtitle>

        <template #append>
            <v-btn
                :icon="watched ? 'mdi-eye-minus' : 'mdi-eye-plus'"
                :color="watched ? 'orange-darken-2' : 'primary'"
                :aria-label="watched ? 'Remove from watchlist' : 'Add to watchlist'"
                variant="tonal"
                size="small"
                @click="emit('pick', {node, watched})"
            />
        </template>
    </v-list-item>
</template>

<script setup>
import {computed} from 'vue'
import {millify} from 'millify'
import CopyButton from './CopyButton.vue'
import {useCopy} from '@/composables/useCopy'

const props = defineProps({
    node: {type: Object, required: true},
    watched: {type: Boolean, default: false},
})

const emit = defineEmits(['pick'])

const {copied, copy} = useCopy()

const STATUS_COLORS = {
    Active: 'green',
    Standby: 'amber-darken-1',
    Disabled: 'red',
    Whitelisted: 'grey-darken-1',
}

const statusColor = computed(() => STATUS_COLORS[props.node.status] ?? 'purple')
</script>
