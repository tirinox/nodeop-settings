<template>
    <div>
        <div class="d-flex align-center flex-wrap ga-3 mb-2">
            <h1 class="text-headline-large">Your watchlist</h1>
            <v-progress-circular v-show="loadingNodes" :size="28" color="primary" indeterminate/>
            <v-spacer/>
            <SaveResetButtons v-if="isNodeListUpdated" @save="actionSave" @reset="restoreOriginalNodes"/>
        </div>

        <p class="text-body-large mb-4">
            Please choose the nodes you want to monitor from the list below.
            There are total <strong>{{ nodes.length }}</strong> nodes in the THORChain network.
        </p>

        <div class="d-flex flex-wrap align-center ga-3 mb-4">
            <v-btn-toggle
                v-model="filterCondition"
                mandatory
                divided
                variant="outlined"
                density="comfortable"
                color="primary"
            >
                <v-btn value="all">All</v-btn>
                <v-btn value="active" append-icon="mdi-filter-outline">Active</v-btn>
                <v-btn value="other" append-icon="mdi-filter-outline">Other</v-btn>
            </v-btn-toggle>

            <v-text-field
                v-model="searchString"
                class="search-field"
                label="Search..."
                placeholder="Enter any part of address, bond, status or version..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                clearable
                hide-details
                :disabled="loadingNodes"
            />
        </div>

        <v-row>
            <v-col cols="12" md="6">
                <v-card variant="outlined">
                    <v-card-title class="d-flex align-center flex-wrap ga-2">
                        Nodes
                        <span class="text-disabled">({{ availableNodes.length }})</span>
                        <v-spacer/>
                        <v-btn
                            icon="mdi-reload"
                            size="small"
                            variant="text"
                            aria-label="Reload nodes"
                            :disabled="loadingNodes"
                            @click="loadNodes"
                        />
                        <v-btn
                            v-show="availableNodes.length > 0"
                            prepend-icon="mdi-fast-forward"
                            size="small"
                            variant="tonal"
                            :disabled="loadingNodes"
                            @click="addAll"
                        >
                            Watch all
                        </v-btn>
                    </v-card-title>
                    <v-divider/>

                    <v-skeleton-loader v-if="loadingNodes" type="list-item-avatar-two-line@4"/>

                    <v-virtual-scroll
                        v-else-if="availableNodes.length > 0"
                        :items="availableNodes"
                        :item-height="ITEM_HEIGHT"
                        :height="LIST_HEIGHT"
                        item-key="node_address"
                    >
                        <template #default="{ item }">
                            <NodeListItem :node="item" @pick="pick"/>
                        </template>
                    </v-virtual-scroll>

                    <EmptyState v-else :searching="anySearch"/>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card variant="outlined">
                    <v-card-title class="d-flex align-center flex-wrap ga-2">
                        Watchlist
                        <span class="text-disabled">({{ watchlistAddresses.length }})</span>
                        <v-spacer/>
                        <v-btn
                            v-show="watchlistAddresses.length > 0"
                            prepend-icon="mdi-rewind"
                            color="orange-accent-4"
                            size="small"
                            variant="tonal"
                            :disabled="loadingNodes"
                            @click="removeAll"
                        >
                            Unwatch all
                        </v-btn>
                    </v-card-title>
                    <v-divider/>

                    <v-skeleton-loader v-if="loadingNodes" type="list-item-avatar-two-line@4"/>

                    <v-virtual-scroll
                        v-else-if="watchListNodes.length > 0"
                        :items="watchListNodes"
                        :item-height="ITEM_HEIGHT"
                        :height="LIST_HEIGHT"
                        item-key="node_address"
                    >
                        <template #default="{ item }">
                            <NodeListItem :node="item" watched @pick="pick"/>
                        </template>
                    </v-virtual-scroll>

                    <EmptyState v-else :searching="anySearch"/>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
import {computed, h, onMounted, ref} from 'vue'
import NodeListItem from '@/components/NodeListItem.vue'
import SaveResetButtons from '@/components/SaveResetButtons.vue'
import {isNodeListUpdated, loadNodeList, restoreOriginalNodes, saveSettings, store} from '@/service/api'
import {notifySaveResult} from '@/service/notify'

const THORDIV = 1e-8
const ITEM_HEIGHT = 80
const LIST_HEIGHT = 500

const EmptyState = (props) => h('div', {class: 'text-center text-title-large text-disabled pa-10'},
    props.searching ? 'Not found...' : 'Empty list')
EmptyState.props = ['searching']

const nodes = ref([])
const loadingNodes = ref(false)
const searchString = ref('')
const filterCondition = ref('all')

function sortNodes(list) {
    return list.sort((a, b) => b.bond_rune - a.bond_rune)
}

async function loadNodes() {
    loadingNodes.value = true
    try {
        const list = await loadNodeList()
        nodes.value = sortNodes(list.map(n => ({
            ...n,
            initials: String(n.node_address ?? '').slice(-4),
            bond_rune: (parseFloat(n.total_bond) * THORDIV).toFixed(1),
        })))
    } catch (e) {
        console.error('Failed to load the node list', e)
    } finally {
        loadingNodes.value = false
    }
}

onMounted(loadNodes)

const needle = computed(() => (searchString.value ?? '').trim().toLowerCase())
const anySearch = computed(() => needle.value !== '')

function isRelevantToSearch(n) {
    if (!anySearch.value) {
        return true
    }
    const q = needle.value
    return [n.node_address, n.bond_rune, n.status, n.version]
        .some(field => String(field ?? '').toLowerCase().includes(q))
}

function isRelevantToFilters(n) {
    const cond = filterCondition.value
    return cond === 'all' ||
        (cond === 'active' && n.status === 'Active') ||
        (cond === 'other' && n.status !== 'Active')
}

const watchlistAddresses = computed(() => store.nodesList)

const nodeMap = computed(() => new Map(nodes.value.map(node => [node.node_address, node])))

const availableNodes = computed(() => {
    const watched = new Set(store.nodesList)
    return nodes.value.filter(n =>
        isRelevantToSearch(n) &&
        isRelevantToFilters(n) &&
        !watched.has(n.node_address)
    )
})

const watchListNodes = computed(() => {
    const results = store.nodesList.map(address => nodeMap.value.get(address) ?? {
        status: 'Not found',
        node_address: address,
        initials: '???',
        bond_rune: 0,
    })
    return sortNodes(results).filter(isRelevantToSearch)
})

function addAll() {
    const extra = availableNodes.value.map(n => n.node_address)
    store.nodesList = [...new Set([...store.nodesList, ...extra])]
}

function removeAll() {
    store.nodesList = []
}

function pick({node, watched}) {
    const address = node.node_address
    if (watched) {
        store.nodesList = store.nodesList.filter(a => a !== address)
    } else if (!store.nodesList.includes(address)) {
        store.nodesList.push(address)
    }
}

async function actionSave() {
    notifySaveResult(await saveSettings(), 'Your watchlist is saved.')
}
</script>

<style scoped>
.search-field {
    flex: 1 1 280px;
    min-width: 0;
}
</style>
