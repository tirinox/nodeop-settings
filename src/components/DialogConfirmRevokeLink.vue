<template>
    <v-dialog v-model="show" max-width="360">
        <v-card prepend-icon="mdi-alert-outline" title="Are you sure?">
            <v-card-text>
                Are you sure to revoke this link? You will have to re-generate the setup link through the bot.
            </v-card-text>

            <v-card-actions>
                <v-btn variant="text" @click="show = false">Cancel</v-btn>
                <v-spacer/>
                <v-btn color="error" variant="flat" @click="confirm">Yes, do it!</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
const show = defineModel({type: Boolean, default: false})
const emit = defineEmits(['confirmed'])

function confirm() {
    show.value = false
    emit('confirmed')
}
</script>
