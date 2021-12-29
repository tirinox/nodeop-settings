<template>
    <div>
        <v-snackbar
            :timeout="2000"
            :value="true"
            color="success accent-4"
            elevation="24"
            v-model="savedAlertActive"
        >
            Your watchlist saved.
        </v-snackbar>

        <v-row>
            <v-col>
                <div class="text-h4">
                    Your watchlist
                    <v-progress-circular
                        :size="30"
                        color="primary"
                        indeterminate
                        v-show="loadingNodes"
                        class="ml-3"
                    ></v-progress-circular>
                </div>

                <p>Please choose the nodes you want to monitor from the list bellow.</p>

                <div>
                    <v-text-field
                        label="Search..."
                        clearable
                        :disabled="loadingNodes"
                        v-model="searchString"
                        placeholder="Enter any part of address or bond...">
                        <template v-slot:append-outer>
                            <v-btn-toggle v-model="filterCondition">
                                <v-btn value="all">
                                    All
                                </v-btn>

                                <v-btn value="active">
                                    Active
                                    <v-icon>mdi-filter-outline</v-icon>
                                </v-btn>

                                <v-btn value="other">
                                    Other
                                    <v-icon>mdi-filter-outline</v-icon>
                                </v-btn>
                            </v-btn-toggle>
                        </template>
                    </v-text-field>
                </div>

            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <div class="text-h5">
                    THORChain nodes
                    <span class="text--disabled">({{ nodes.length }})</span>

                    <v-btn :disabled="loadingNodes" @click="loadNodes" class="ml-2" small>
                        <v-icon>mdi-reload</v-icon>
                    </v-btn>

                    <v-btn class="ma-2" @click="addAll"
                           :disabled="loadingNodes"
                           small
                           v-show="availableNodes.length > 0">
                        <v-icon>mdi-fast-forward</v-icon>
                        Watch all
                    </v-btn>
                </div>

                <v-skeleton-loader
                    v-if="loadingNodes"
                    type="article, article"
                ></v-skeleton-loader>

                <v-virtual-scroll
                    :items="availableNodes"
                    :item-height="70"
                    height="500"
                    bench="2"
                    v-else-if="availableNodes.length > 0"
                >
                    <template v-slot:default="{ item }">
                        <NodeListItem :node="item" v-on:pick="pick"></NodeListItem>
                    </template>
                </v-virtual-scroll>
                <div v-else class="text-center">
                    <div class="text-h6 text--disabled pa-5">
                        <span v-if="anySearch">Not found...</span>
                        <span v-else>Empty list</span>
                    </div>
                </div>
            </v-col>


            <v-col>
                <div class="text-h5">
                    Watchlist
                    <span class="text--disabled">({{ watchlistAddresses.length }})</span>

                    <v-btn class="ma-2" color="red accent-1"
                           small
                           v-show="watchlistAddresses.length > 0"
                           @click="removeAll"
                           :disabled="loadingNodes"
                    >
                        <v-icon>mdi-rewind</v-icon>
                        Unwatch all
                    </v-btn>
                </div>

                <v-skeleton-loader
                    v-if="loadingNodes"
                    type="article, article"
                ></v-skeleton-loader>

                <v-virtual-scroll
                    :items="watchListNodes"
                    :item-height="70"
                    height="500"
                    v-else-if="watchlistAddresses.length > 0"
                >
                    <template v-slot:default="{ item }">
                        <NodeListItem :node="item" watched="true" v-on:pick="pick"></NodeListItem>
                    </template>
                </v-virtual-scroll>

                <div v-else class="text-center pa-5">
                    <div class="text-h6 text--disabled">Empty list</div>
                </div>
            </v-col>
        </v-row>
    </div>
</template>

<script>

import axios from "axios";
import NodeListItem from "../components/NodeListItem";
import _ from 'lodash'

const NODE_URL = 'https://midgard.thorchain.info/v2/thorchain/nodes'
const THORDIV = 1e-8
const KEY_WATCH_LIST = 'watchList'

function sortNodes(nodes) {
    nodes.sort((a, b) => b.bond_rune - a.bond_rune)
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
            searchString: '',
            savedAlertActive: false,
            filterCondition: 'all',
        }
    },
    async mounted() {
        await this.loadNodes()
        this.watchlistAddresses = this.$ls.get(KEY_WATCH_LIST, [])
    },
    methods: {
        addAll() {
            this.watchlistAddresses = this.availableNodes.map(n => n.node_address)
            this.saveWatchListDebounce()
        },
        removeAll() {
            this.watchlistAddresses = []
            this.saveWatchListDebounce()
        },
        saveWatchListDebounce: _.debounce(function () {
            this.saveWatchList()
        }, 1000),
        saveWatchList() {
            this.$ls.set(KEY_WATCH_LIST, this.watchlistAddresses)
            this.savedAlertActive = true
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
        pick({node, watched}) {
            if (watched) {
                this.watchlistAddresses = this.watchlistAddresses.filter(a => a !== node.node_address)
                this.saveWatchListDebounce()
            } else {
                if (!this.watchlistAddresses.some(a => a === node.node_address)) {
                    this.watchlistAddresses.push(node.node_address)
                    this.saveWatchListDebounce()
                }
            }
        },
        isRelevantToSearch(n) {
            if (this.anySearch) {
                return n.node_address.includes(this.searchString.toLowerCase()) ||
                    String(n.bond_rune).includes(this.searchString)
            } else {
                return true
            }
        },
        isRelevantToFilters(n) {
            const cond = this.filterCondition
            const st = n.status
            return cond === 'all' || (cond === 'active' && st === 'Active') ||
                (cond === 'other' && st !== 'Active')
        },
    },
    computed: {
        nodeMap() {
            return Object.fromEntries(this.nodes.map(node => [node.node_address, node]))
        },
        anySearch() {
            return this.searchString !== ''
        },
        availableNodes() {
            const mySet = new Set(this.watchlistAddresses)
            return this.nodes.filter(n =>
                this.isRelevantToSearch(n) &&
                this.isRelevantToFilters(n) &&
                !mySet.has(n.node_address)
            )
        },
        watchListNodes() {
            const results = []
            const nodeMap = this.nodeMap
            for (const address of this.watchlistAddresses) {
                const node = nodeMap[address]
                results.push(node ?? {
                    status: 'Not found',
                    node_address: address,
                    initials: '???',
                    watched: true,
                    bond: 0,
                    bond_rune: 0
                })
            }
            sortNodes(results)
            return results.filter(this.isRelevantToSearch)
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