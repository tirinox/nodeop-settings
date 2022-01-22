<template>

    <v-list-item :key="node.node_address">
        <v-list-item-avatar @click="copyNodeAddress">
            <v-btn
                fab
                small
                depressed
                :color="colorClass"
                light
            >
                <span v-show="!copied">{{ node.initials }}</span>
                <v-icon v-show="copied">mdi-content-copy</v-icon>

            </v-btn>
        </v-list-item-avatar>

        <v-list-item-content>
            <v-list-item-title><code>{{ node.node_address }}</code></v-list-item-title>
            <div>
                <v-chip :color="colorClass" x-small>{{ node.status }} v.{{ node.version }}</v-chip>
                <span class="ma-2">ᚱ<strong>{{ millify(node.bond_rune) }}</strong> bonded</span>
            </div>
        </v-list-item-content>

        <v-list-item-action>
            <v-btn
                depressed
                small
                @click="buttonAction"
            >
                <div v-if="watched">
                    <v-icon color="orange darken-2">
                        mdi-eye-minus
                    </v-icon>
                    Del
                </div>
                <div v-else>
                    <v-icon>
                        mdi-eye-plus
                    </v-icon>
                    Add
                </div>
            </v-btn>
        </v-list-item-action>
    </v-list-item>
</template>

<script>
//
//const COLORS = [
//    'red', 'pink', 'purple',
//    'deep-purple', 'indigo', 'blue',
//    'light-blue', 'cyan', 'teal',
//    'green', 'light-green', 'lime',
//    'yellow', 'amber', 'orange',
//    'deep-orange', 'brown', 'blue-gray', 'gray',
//]
//
//function intHashCode(s) {
//    let hash = 0, i, chr;
//    if (s.length === 0) return hash;
//    for (i = 0; i < s.length; i++) {
//        chr = s.charCodeAt(i);
//        hash = ((hash << 5) - hash) + chr;
//        hash |= 0; // Convert to 32bit integer
//    }
//    return hash;
//}

import copy from 'copy-text-to-clipboard'
import millify from "millify";

export default {
    name: "NodeListItem",
    props: ['node', 'watched'],
    computed: {
        colorClass() {
            const st = this.node.status
            if (st === 'Active') {
                return 'teal'
            } else if (st === 'Standby') {
                return 'amber darken-1'
            } else if (st === 'Disabled') {
                return 'red'
            } else if (st === 'Whitelisted') {
                return 'gray darken-1'
            } else {
                return 'purple'
            }
        },
    },
    data() {
        return {
            copied: false,
        }
    },
    methods: {
        buttonAction() {
            this.$emit('pick', {
                node: this.node, watched: this.watched
            })
        },
        millify,
        copyNodeAddress() {
            copy(this.node.node_address)
            this.copied = true
            setInterval(() => {
                this.copied = false
            }, 2000)
        },
    }
}
</script>

<style scoped>

</style>