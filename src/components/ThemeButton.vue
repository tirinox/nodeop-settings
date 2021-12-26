<template>
    <div>
        <v-tooltip v-if="!$vuetify.theme.dark" bottom>
            <template v-slot:activator="{ on }">
                <v-icon class="mr-1" v-on="on" @click="darkMode">mdi-moon-waxing-crescent</v-icon>
            </template>
            <span>Dark Mode On</span>
        </v-tooltip>

        <v-tooltip v-else bottom>
            <template v-slot:activator="{ on }">
                <v-icon color="yellow" v-on="on" @click="darkMode">mdi-white-balance-sunny</v-icon>
            </template>
            <span>Dark Mode Off</span>
        </v-tooltip>
    </div>
</template>

<script>

export default {
    name: "ThemeButton",
    data() {
        return {
            on: false
        }
    },
    methods: {
        darkMode() {
            this.on = !this.on
        }
    },
    watch: {
        on(v) {
            this.$vuetify.theme.dark = v
            this.$ls.set('themeIsDark', v)
        }
    },
    mounted() {
        this.on = this.$ls.get('themeIsDark', false)
    }
}
</script>

<style scoped>

</style>