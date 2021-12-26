<template>
    <div>
        <v-row>
            <v-col>
                <div class="text-h3">Select nodes!
                    <v-progress-circular
                        :size="30"
                        color="primary"
                        indeterminate
                        v-show="loadingNodes"
                    ></v-progress-circular>
                </div>

                <p>Total nodes: {{ nodes.length }}</p>

                <v-btn :disabled="loadingNodes" @click="loadNodes">
                    <v-icon>mdi-reload</v-icon>
                    Reload
                </v-btn>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <h3>All THORChain nodes</h3>
                <v-virtual-scroll
                    :items="nodes"
                    :item-height="70"
                    height="500"
                    bench="2"
                    v-if="nodes.length > 0"
                >
                    <template v-slot:default="{ item }">
                        <NodeListItem :node="item" v-on:pick="pick"></NodeListItem>
                    </template>
                </v-virtual-scroll>
                <div v-else class="text-center">
                    <div class="text-h6 text--disabled">Empty list</div>
                </div>
            </v-col>

            <v-col>
                <h3>Watchlist</h3>
                <v-virtual-scroll
                    :items="watchListNodes"
                    :item-height="70"
                    height="500"
                    v-if="watchlistAddresses.length > 0"
                >
                    <template v-slot:default="{ item }">
                        <NodeListItem :node="item" watched="true"></NodeListItem>
                    </template>
                </v-virtual-scroll>
                <div v-else class="text-center">
                    <div class="text-h6 text--disabled">Empty list</div>
                </div>
            </v-col>
        </v-row>
    </div>
</template>

<script>

import axios from "axios";
import NodeListItem from "../components/NodeListItem";

const NODE_URL = 'https://midgard.thorchain.info/v2/thorchain/nodes'
const THORDIV = 1e-8

function sortNodes(nodes) {
    nodes.sort((a, b) => a.bond_rune - b.bond_rune)
    return nodes
}

export default {
    name: 'NodeSelectPage',
    components: {NodeListItem},
    data() {
        return {
            nodes: [],
            watchlistAddresses: [],
            loadingNodes: false,
        }
    },
    async mounted() {
        await this.loadNodes()
        this.watchlistAddresses = this.$ls.get('watchlist', [])
        console.log(this.watchlistAddresses.length)
    },
    methods: {
        saveWatchList() {
            this.$ls.set('watchList', this.watchlistAddresses)
        },
        async loadNodes() {
            this.loadingNodes = true
            const result = await axios.get(NODE_URL)
            let nodes = result.data
            nodes = nodes.map(n => ({
                ...n,
                initials: n.node_address.slice(-4),
                bond_rune: (parseFloat(n.bond) * THORDIV).toFixed(1)
            }))
            sortNodes(nodes)
            this.nodes = nodes
            this.loadingNodes = false
        },
        pick(node, watched) {
            if(watched) {
                this.watchlistAddresses = this.watchlistAddresses.filter(a => a !== node.node_address)
                console.log(this.watchlistAddresses)
                this.saveWatchList()
            } else {
                if(!this.watchlistAddresses.some(a => a === node.node_address)) {
                    this.watchlistAddresses.push(node.node_address)
                    this.saveWatchList()
                }
            }
        },
    },
    computed: {
        nodeMap() {
            return Object.fromEntries(this.nodes.map(node => [node.node_address, node]))
        },
        watchListNodes() {
            console.log('this.watchlistAddresses called')
            const results = []
            const nodeMap = this.nodeMap
            for (const address of this.watchlistAddresses) {
                const node = nodeMap[address]
                results.push(node ?? {
                    status: 'Not found',
                    address,
                    initials: '???',
                    bond: 0,
                    bond_rune: 0
                })
            }
            sortNodes(results)
            return results
        }
    },
}

</script>

<style>
pre {
    white-space: pre-wrap; /* Since CSS 2.1 */
    word-wrap: break-word; /* Internet Explorer 5.5+ */
}
</style>