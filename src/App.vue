<template>
    <div id="app">
        <v-app>
            <v-app-bar elevate-on-scroll
                app
            >
                <v-toolbar-title>
                    <v-avatar>
                        <img src="/android-chrome-512x512.png" alt="logo" />
                    </v-avatar>

                    NodeOp Tool settings
                </v-toolbar-title>

                <v-spacer></v-spacer>

                <v-btn icon>
                    <ThemeButton></ThemeButton>
                </v-btn>

            </v-app-bar>

            <v-navigation-drawer
                app
                left
                permanent
                v-model="drawer"
                width="200"
            >

                <v-list>

                    <v-list-item v-for="item in menu_items" :key="item.id" :to="item.url" link>
                        {{ item.name }}
                    </v-list-item>

                </v-list>
            </v-navigation-drawer>

            <v-main>
                <v-container>
                    <router-view></router-view>
                </v-container>
            </v-main>

        </v-app>
    </div>
</template>

<script>
import ThemeButton from "./components/ThemeButton";
export default {
    components: {ThemeButton},
    data() {
        return {
            drawer: true,
            menu_items: [
                {
                    id: 0,
                    name: 'Start',
                    url: '/'
                },
                {
                    id: 1,
                    name: 'Watchlist',
                    url: '/select/nodes'
                },
                {
                    id: 2,
                    name: 'Alerts',
                    url: '/alerts'
                },
            ]
        }
    },
    mounted() {
        document.title = 'NodeOp setup'
    }
}
</script>

