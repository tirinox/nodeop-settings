<template>
    <v-dialog v-model="show" max-width="300px">
        <v-card>
            <v-card-title class="text-h5">
                Are you sure?
            </v-card-title>

            <v-card-text>
                Are you sure to revoke this link? You will have to re-generate the setup link through the bot.
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>

                <v-btn text @click.stop="show=false">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click.stop="confirm">Yes, do it!</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'DialogConfirmRevokeLink',
    props: {
        value: Boolean
    },
    computed: {
        show: {
            get() {
                return this.value
            },
            set(value) {
                this.$emit('input', value)
            }
        }
    },
    methods: {
        confirm() {
            this.show = false
            this.$emit('confirmed')
        }
    }
}
</script>
