<template>
    <div>
        <v-row>
            <v-col>
                <h1>Alerts setup</h1>
                <v-switch v-model="allPaused" inset>
                    <template v-slot:label>All paused</template>
                </v-switch>
            </v-col>
        </v-row>

        <code>{{ JSON.stringify(this.$data, null, 4)}}</code>

    </div>
</template>

<script>
export default {
    name: "AlertsPage",
    data() {
        return {
            allPaused: false,
        }
    },
}
</script>

<style scoped>

</style>