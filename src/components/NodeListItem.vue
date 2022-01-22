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
<!--                <v-icon v-if="watched" class="eye" large>mdi-eye</v-icon>-->

                <v-icon v-show="copied" :class="textColorClass">mdi-check-circle-outline</v-icon>
                <span v-show="!copied" :class="textColorClass">{{ node.initials }}</span>

            </v-btn>
        </v-list-item-avatar>

        <v-list-item-content>
            <v-list-item-title>
                <code>{{ node.node_address }}</code>
                <v-icon @click="copyNodeAddress" x-small>
                    mdi-content-copy
                </v-icon>
            </v-list-item-title>
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

                </div>
                <div v-else>
                    <v-icon>
                        mdi-eye-plus
                    </v-icon>
                </div>
            </v-btn>
        </v-list-item-action>
    </v-list-item>
</template>

<script>

import copy from 'copy-text-to-clipboard'
import millify from "millify";

export default {
    name: "NodeListItem",
    props: ['node', 'watched'],
    computed: {
        colorClass() {
            const st = this.node.status
            if (st === 'Active') {
                return 'green'
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
        textColorClass() {
            if(this.node.status === 'Whitelisted') {
                return 'blacl--text'
            } else {
                return 'white--text'
            }
        }
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
    .eye {
        position: absolute;
        opacity: 20%;
        left: auto;
    }
</style>