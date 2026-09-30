<template>
    <div class="d-flex ga-2">
        <v-btn color="secondary" variant="tonal" prepend-icon="mdi-restore" @click="emit('reset')">Reset</v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-content-save" :loading="isTokenLoading" @click="emit('save')">
            Save
        </v-btn>
    </div>
</template>

<script setup>
import {isTokenLoading} from '@/service/api'

const emit = defineEmits(['save', 'reset'])
</script>
