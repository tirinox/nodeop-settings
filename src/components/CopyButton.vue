<template>
    <v-btn
        :icon="copied ? 'mdi-check-circle-outline' : 'mdi-content-copy'"
        :color="copied ? 'success' : undefined"
        size="x-small"
        variant="text"
        density="comfortable"
        :aria-label="copied ? 'Copied' : 'Copy to clipboard'"
        @click.stop="doCopy"
    />
</template>

<script setup>
import {useCopy} from '@/composables/useCopy'

const props = defineProps({
    content: {type: String, required: true},
})

const {copied, copy} = useCopy()

function doCopy() {
    copy(props.content)
}
</script>
