<template>
    <div class="d-inline">
        <v-icon x-small v-if="copied" >
            mdi-check-circle-outline
        </v-icon>
        <v-icon class="row-pointer" @click="doCopy" x-small v-else>
            mdi-content-copy
        </v-icon>
    </div>

</template>

<script>
import copy from "copy-text-to-clipboard";

export default {
    name: "CopyButton",
    props: ['content'],
    data() {
        return {
            copied: false
        }
    },
    methods: {
        doCopy() {
            copy(this.content)
            this.copied = true
            setInterval(() => {
                this.copied = false
            }, 2000)
        }
    }
}
</script>

<style scoped>
.row-pointer :hover {
    cursor: pointer;
}
</style>