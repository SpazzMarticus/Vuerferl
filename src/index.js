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
            playerCount: 2,
            running: false,
        };
    },
    mounted() {
        if (localStorage.selectedTheme && this.themes[localStorage.selectedTheme]) {
            this.selectedTheme = localStorage.selectedTheme;
        }
        if (localStorage.playerCount && (1 <= localStorage.playerCount <= 4)) {
            this.playerCount = parseInt(localStorage.playerCount);
        }
    },
    methods: {
        run() {
            localStorage.selectedTheme = this.selectedTheme;
            localStorage.playerCount = this.playerCount;
            this.running = true;
        },
        reset() {
            this.running = false;
            this.$refs.game.reset(true);
        }
    }
});