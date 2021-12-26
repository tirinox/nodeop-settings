<template>

    <v-list-item :key="node.node_address">
        <v-list-item-avatar>
            <v-btn
                fab
                small
                depressed
                :color="colorClass"
                light
            >
                {{ node.initials }}
            </v-btn>
        </v-list-item-avatar>

        <v-list-item-content>
            <v-list-item-title><code>{{ node.node_address }}</code></v-list-item-title>
            <div><em>{{ node.status }}</em> ({{ node.bond_rune }} Rune bonded)</div>
        </v-list-item-content>

        <v-list-item-action>
            <v-btn
                depressed
                small
                @click="buttonAction"
            >
                <div v-if="watched">
                    Remove
                    <v-icon color="orange darken-4" right>
                        mdi-open-in-new
                    </v-icon>
                </div>
                <div v-else>
                    Add
                    <v-icon color="orange darken-4" right>
                        mdi-open-in-new
                    </v-icon>
                </div>
            </v-btn>
        </v-list-item-action>
    </v-list-item>
</template>

<script>

const COLORS = [
    'red', 'pink', 'purple',
    'deep-purple', 'indigo', 'blue',
    'light-blue', 'cyan', 'teal',
    'green', 'light-green', 'lime',
    'yellow', 'amber', 'orange',
    'deep-orange', 'brown', 'blue-gray', 'gray',
]

function intHashCode(s) {
    let hash = 0, i, chr;
    if (s.length === 0) return hash;
    for (i = 0; i < s.length; i++) {
        chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export default {
    name: "NodeListItem",
    props: ['node', 'watched'],
    computed: {
        colorClass() {
            return COLORS[intHashCode(this.node.initials) % COLORS.length]
        },
    },
    methods: {
        buttonAction() {
            this.$emit('pick', this.node, this.watched)
        }
    }
}
</script>

<style scoped>

</style>