<template>
    <div>
        <div class="text-h4">Welcome to the NodeOp tool setup</div>

        <v-alert
            class="mt-4"
            dense
            border="left"
            type="error"
            v-if="!validConnection"
        >
            The token is <strong>missing</strong> or it has <strong>expired</strong>.<br>
            Please generate a new link using THORChain Monitoring Bot inside your favorite messenger (Telegram/Discord/Slack).

            <br><br>
            <code># todo: add links</code>
        </v-alert>
    </div>
</template>

<script>
import {TokenStore} from "../service/api";

export default {
    name: "WelcomePage",
    mixins: [TokenStore],
    computed: {
        envName() {
            return process.env.NODE_ENV
        },
        validConnection() {
            return Boolean(TokenStore.token)
        }
    }
}
</script>

<style scoped>

</style>