<template>
    <div>
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

                    <div class="float-end" v-if="isNodeListUpdated">
                        <v-btn color="primary" large class="mx-2" @click="actionSave">Save</v-btn>
                        <v-btn color="secondary" large class="mx-2" @click="actionReset">Reset</v-btn>
                    </div>
                </div>

                <p>
                    Please choose the nodes you want to monitor from the list bellow.
                    There are total <strong>{{ nodes.length }}</strong> nodes in the THORChain network.
                </p>

                <div>
                    <v-text-field
                        label="Search..."
                        clearable
                        :disabled="loadingNodes"
                        v-model="searchString"
                        placeholder="Enter any part of address or bond...">
                        <template v-slot:prepend>
                            <v-btn-toggle v-model="filterCondition" shaped mandatory>
                                <v-btn value="all" small>
                                    All
                                </v-btn>

                                <v-btn value="active" small>
                                    Active
                                    <v-icon>mdi-filter-outline</v-icon>
                                </v-btn>

                                <v-btn value="other" small>
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
                    Nodes
                    <span class="text--disabled">({{ availableNodes.length }})</span>

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
                    :item-height="80"
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

                    <v-btn class="ma-2" color="orange accent-4"
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
                    :item-height="80"
                    height="500"
                    v-else-if="watchlistAddresses.length > 0"
                >
                    <template v-slot:default="{ item }">
                        <NodeListItem :node="item" watched="true" v-on:pick="pick"></NodeListItem>
                    </template>
                </v-virtual-scroll>

                <div v-else class="text-center pa-5">
                    <div class="text-h6 text--disabled pa-5">
                        <span v-if="anySearch">Not found...</span>
                        <span v-else>Empty list</span>
                    </div>
                </div>
            </v-col>
        </v-row>
    </div>
</template>

<script>

import axios from "axios";
import NodeListItem from "../components/NodeListItem";
import {APIConnector, SettingsStorageMixin, TokenStore} from "../service/api";
import {eventBus, EVENTS} from "../service/bus";

const NODE_URL = 'https://midgard.thorchain.info/v2/thorchain/nodes'
const THORDIV = 1e-8

// const KEY_WATCH_LIST = 'watchList'

function sortNodes(nodes) {
    nodes.sort((a, b) => b.bond_rune - a.bond_rune)
    return nodes
}

export default {
    name: 'NodeSelectPage',
    components: {NodeListItem},
    mixins: [SettingsStorageMixin],
    data() {
        return {
            nodes: [],
            loadingNodes: false,
            searchString: '',
            savedAlertActive: false,
            errorAlertActive: false,
            filterCondition: 'all',
        }
    },
    async mounted() {
        await this.loadNodes()
    },
    methods: {
        addAll() {
            TokenStore.nodesList = this.availableNodes.map(n => n.node_address)
        },
        removeAll() {
            TokenStore.nodesList = []
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
                TokenStore.nodesList = TokenStore.nodesList.filter(a => a !== node.node_address)
            } else {
                if (!TokenStore.nodesList.some(a => a === node.node_address)) {
                    TokenStore.nodesList.push(node.node_address)
                }
            }
        },
        isRelevantToSearch(n) {
            const needle = this.searchString ? this.searchString.toLowerCase() : ''
            if (this.anySearch) {
                return n.node_address.includes(needle) ||
                    String(n.bond_rune).includes(needle) ||
                    n.status.toLowerCase().includes(needle) ||
                    n.version.includes(needle)
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
        actionReset() {
            const api = new APIConnector()
            api.restoreOriginalNodes()
        },
        async actionSave() {
            const api = new APIConnector()
            const result = await api.saveSettings()
            eventBus.$emit(EVENTS.PRESENT_SAVE_RESULT, result)
        },
    },
    computed: {
        watchlistAddresses() {
            return TokenStore.nodesList
        },
        nodeMap() {
            return Object.fromEntries(this.nodes.map(node => [node.node_address, node]))
        },
        anySearch() {
            return this.searchString !== ''
        },
        availableNodes() {
            const mySet = new Set(TokenStore.nodesList)
            return this.nodes.filter(n =>
                this.isRelevantToSearch(n) &&
                this.isRelevantToFilters(n) &&
                !mySet.has(n.node_address)
            )
        },
        watchListNodes() {
            const results = []
            const nodeMap = this.nodeMap
            for (const address of TokenStore.nodesList) {
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