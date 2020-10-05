import Vue from 'Vue';
import Game from './components/Game.vue';
import Vuerfel from './components/Wuerfel.vue';
import Dropdown from './components/Dropdown.vue';

import themes from './modules/themes.js';

new Vue({
    el: '#app',
    components: { Game, 'wuerfel': Vuerfel, Dropdown },
    data() {
        return {
            themes,
            selectedTheme: 0,
            running: false,
        };
    },
    mounted() {
        if (localStorage.selectedTheme && this.themes[localStorage.selectedTheme]) {
            this.selectedTheme = localStorage.selectedTheme;
        }
    },
    methods: {
        run() {
            localStorage.selectedTheme = this.selectedTheme;
            this.running = true;
        },
        reset() {
            this.running = false;
            this.$refs.game.reset(true);
        }
    }
});