import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import Storage from 'vue-ls';

Vue.config.productionTip = false


const options = {
    namespace: 'vuejs__', // key prefix
    name: 'ls', // name variable Vue.[ls] or this.[$ls],
    storage: 'local', // storage name session, local, memory
};

Vue.use(Storage, options);


new Vue({
    vuetify,
    router,
    render: h => h(App)
}).$mount('#app')
