const prng = new Math.seedrandom();

const randomInteger = function (min, max) {
    return Math.floor(min + prng() * (max - min + 1));
};

const randomDiceValue = function () {
    return randomInteger(1, 6);
}

Vue.component('wuerfel', {
    template: `
    <div 
        class="wuerfel"
        >

        <svg viewBox="0 0 100 100" :fill="color" :opacity="toBeRemoved?0.5:1">
        <defs>
            <linearGradient id="corners" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:rgb(255,255,255);stop-opacity:0.3" />
            </linearGradient>
      </defs>
        <g>
        <!-- face -->
        <rect x="0" y="0" width="100" height="100" rx="12" :fill="color" />
        <rect x="0" y="0" width="100" height="100" rx="12" fill="url(#corners)" />
         <circle cx="50" cy="50" r="48" :fill="color" :opacity="faceOpacity" /> 
        </g>
        <g>
            <!-- pips -->

            <!-- center -->
            <circle r="8" cx="50" cy="50" :fill="pipColor" v-if="value === 1 || value === 3 || value === 5"/>

            <!-- top-right and bottom-left -->
            <circle r="8" cx="31" cy="70" :fill="pipColor" v-if="value === 2 || value === 3 || value === 4 || value === 5"/>
            <circle r="8" cx="69" cy="30" :fill="pipColor" v-if="value === 2 || value === 3 || value === 4 || value === 5"/>

            <!-- top-left and bottom-right -->
            <circle r="8" cx="31" cy="30" :fill="pipColor" v-if="value === 4 || value === 5"/>
            <circle r="8" cx="69" cy="70" :fill="pipColor" v-if="value === 4 || value === 5"/>

            <! -- six --> 
            <circle r="8" cx="31" cy="25" :fill="pipColor" v-if="value === 6"/>
            <circle r="8" cx="31" cy="50" :fill="pipColor" v-if="value === 6"/>
            <circle r="8" cx="31" cy="75" :fill="pipColor" v-if="value === 6"/>  
            <circle r="8" cx="69" cy="25" :fill="pipColor" v-if="value === 6"/>
            <circle r="8" cx="69" cy="50" :fill="pipColor" v-if="value === 6"/>
            <circle r="8" cx="69" cy="75" :fill="pipColor" v-if="value === 6"/>            
            
        </g>
            
        </svg>
    </div>
    `,
    props: {
        color: {
            type: String,
            required: true,
        },
        pipColor: {
            type: String,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
        toBeRemoved: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    computed: {
        faceOpacity() {
            return this.pipColor === '#ffffff' ? 0.6 : 0.5;
        }
    }
});

const rollTimeout = 77;
const rollCount = 3;

function Wuerfel(color, pipColor) {
    this.value = randomDiceValue();
    this.color = color;
    this.pipColor = pipColor;
    this.rolling = true;
    this.roll = () => {
        const interval = setInterval(() => {
            this.value = randomDiceValue();
        }, rollTimeout);
        setTimeout(() => {
            clearInterval(interval);
            this.rolling = false;
        }, rollTimeout * rollCount);
    };
    /**
     * @todo Status-Flags hinzufügen
     */
    this.roll();
}

var wuerfelErzeugen = function (color, pipColor) {
    return new Wuerfel(color, pipColor);
};

const themes = [{
        name: "Theme #1",
        colors: [{
                color: '#fec015',
                pipColor: '#000000',
            }, //yellow
            {
                color: '#f37120',
                pipColor: '#000000',
            }, //orange
            {
                color: '#653795',
                pipColor: '#ffffff',
            }, //purple
            {
                color: '#0084cd',
                pipColor: '#ffffff',
            }, //blue
            {
                color: '#00935c',
                pipColor: '#ffffff',
            }, //green
            {
                color: '#ffffff',
                pipColor: '#000000',
            }, //white
        ]
    },
    {
        name: "Theme #2",
        colors: [{
                color: '#fec015',
                pipColor: '#000000',
            }, //yellow
            {
                color: '#dc6b96',
                pipColor: '#000000',
            }, //pink
            {
                color: '#686a6a',
                pipColor: '#ffffff',
            }, //gray
            {
                color: '#1e439c',
                pipColor: '#ffffff',
            }, //blue
            {
                color: '#82c449',
                pipColor: '#000000',
            }, //green
            {
                color: '#ffffff',
                pipColor: '#000000',
            }, //white
        ]
    },
    {
        name: "Theme #3",
        colors: [{
                color: '#fec015',
                pipColor: '#000000',
            }, //yellow
            {
                color: '#dc6b96',
                pipColor: '#000000',
            }, //pink
            {
                color: '#653795',
                pipColor: '#ffffff',
            }, //purple
            {
                color: '#0e8697',
                pipColor: '#ffffff',
            }, //cyan
            {
                color: '#a86f3a',
                pipColor: '#ffffff',
            }, //brown
            {
                color: '#ffffff',
                pipColor: '#000000',
            }, //white
        ]
    },
];


const log = [];

var data = function (vue, selectedTheme) {
    return {
        tisch: [],
        tablett: [],
        verwendet: [],
        wurfErforderlich: true,
        wurfInProgress: false,
        resetErforderlich: false,
        selectedTheme,
        log,
        hoverValue: null,
    };
}

Vue.component('game', {
    template: `<div>
    <div class="play-area">
        <div class="selected">
            <div class="dice-container">
                <div v-for="wuerfel in verwendet" :key="wuerfel.color">
                    <wuerfel :color="wuerfel.color" :pip-color="wuerfel.pipColor" :value="wuerfel.value">
                    </wuerfel>
                </div>
                <div v-for="index in 3-verwendet.length" :key="'e'+index" class="wuerfel wuerfel-empty">
                </div>
            </div>
        </div>
        <div class="table">
        <div>
            <button  @click="wurf" v-show="wurfErforderlich" :disabled="wurfInProgress">
                <img src="assets/img/rolling-dice-cup.svg" class="icon" />
                Roll
            </button>

            <div class="right" v-show="wurfMoeglich">
            <button @click="wurf" :disabled="wurfInProgress">
                <img src="assets/img/cycle.svg" class="icon" />
                Reroll
            </button>
            </div>

            <button class="centered-axis-xy" @click="reset(false)" v-show="resetErforderlich">
                <img src="assets/img/player-next.svg" class="icon" />
                Next player
            </button>
            </div>

            <div class="dice-container" :class="{usable:!wurfErforderlich}">
                <div v-for="(wuerfel,index) in tisch" :key="index" @click="verwenden(wuerfel)"
                    @mouseover="hoverWuerfel(wuerfel)" @mouseleave="hoverWuerfel(null)">
                    <wuerfel :color="wuerfel.color" :pip-color="wuerfel.pipColor" :value="wuerfel.value"
                        :to-be-removed="!wurfErforderlich && hoverValue && wuerfel.value < hoverValue">
                    </wuerfel>
                </div>
            </div>
        </div>
        <div class="tray">
            <div class="dice-container">
                    <wuerfel v-for="(wuerfel,index) in tablettSorted" :key="index" :color="wuerfel.color" :pip-color="wuerfel.pipColor" :value="wuerfel.value">
                    </wuerfel>
            </div>
        </div>
    </div>

    <div class="log" v-if="log.length>0">
        <div v-for="(entry,index) in log" class="log-entry" :key="index">
            <div>
                #{{log.length - index}}
            </div>
            <div class="areas">
            <div class="selected">
            <div class="dice-container">
                    <wuerfel v-for="(wuerfel,index) in entry.verwendet" :key="index" :color="wuerfel.color"
                        :pip-color="wuerfel.pipColor" :value="wuerfel.value">
                    </wuerfel>
                </div>
                </div>
                <div class="tray">
                <div class="dice-container">
                    <wuerfel v-for="(wuerfel,index) in entry.tablett" :key="index" :color="wuerfel.color"
                        :pip-color="wuerfel.pipColor" :value="wuerfel.value">
                    </wuerfel>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
</div>`,
    props: {
        theme: {
            required: true,
            type: Object,
        }
    },
    data,
    computed: {
        tablettSorted() {
            return this.tablett.sort((a, b) => {
                return a.value > b.value ? 1 : -1;
            });
        },
        wurfMoeglich() {
            return !this.wurfErforderlich && this.tisch.length;
        }
    },
    methods: {
        tischFuellen() {
            this.tisch = [
                wuerfelErzeugen(this.theme.colors[0].color, this.theme.colors[0].pipColor),
                wuerfelErzeugen(this.theme.colors[1].color, this.theme.colors[1].pipColor),
                wuerfelErzeugen(this.theme.colors[2].color, this.theme.colors[2].pipColor),
                wuerfelErzeugen(this.theme.colors[3].color, this.theme.colors[3].pipColor),
                wuerfelErzeugen(this.theme.colors[4].color, this.theme.colors[4].pipColor),
                wuerfelErzeugen(this.theme.colors[5].color, this.theme.colors[5].pipColor),
            ];
        },

        wurf() {
            this.wurfInProgress = true;
            if (!this.tisch.length) {
                this.tischFuellen();
            } else {
                this.tisch = this.tisch.map(wuerfel => {
                    return wuerfelErzeugen(
                        wuerfel.color,
                        wuerfel.pipColor,
                    );
                });
            }

            this.wurfErforderlich = false;
            this.tischSortieren();
        },
        tischSortieren() {
            const sort = () => {
                this.tisch.sort((a, b) => {
                    return a.value < b.value ? 1 : -1;
                });
            };
            const interval = setInterval(() => {
                sort();
            }, rollTimeout);
            setTimeout(() => {
                clearInterval(interval);
                sort();
                this.wurfInProgress = false;
            }, rollTimeout * rollCount);
        },
        verwenden(ausgewaehlterWuerfel) {
            //Solange der Würfel rollt, darf er nicht ausgewählt werden
            if (ausgewaehlterWuerfel.rolling) {
                return;
            }
            //Vor der Verwendung muss gewürfelt werden
            if (this.wurfErforderlich) {
                return;
            }
            /**
             * Ausgewählten Würfel und Würfel mit
             * geringerer Augenzahl von Tisch nehmen
             */
            this.tisch = this.tisch.reduce((tisch, wuerfel) => {
                if (wuerfel === ausgewaehlterWuerfel) {
                    this.verwendet.push(wuerfel);
                } else if (wuerfel.value < ausgewaehlterWuerfel.value) {
                    this.tablett.push(wuerfel);
                } else {
                    tisch.push(wuerfel);
                }
                return tisch;
            }, []);

            if (this.verwendet.length >= 3) {
                //Übrige Würfel auf Tablett legen und Tisch leeren
                this.tablett.push(...this.tisch);
                this.tisch = [];

                this.resetErforderlich = true;
            } else if (this.tisch.length) {
                //Falls Tisch nicht leer, Wurf erforderlich
                this.wurfErforderlich = true;
            } else {
                this.resetErforderlich = true;
            }
            this.hoverValue = null; //Zurücksetzen
        },
        hoverWuerfel(wuerfel) {
            this.hoverValue = wuerfel ? wuerfel.value : null;
        },
        reset(clearLog = false) {
            if (clearLog) {
                this.log.length = 0; //Empty array without creating a new instance
            } else {
                this.log.unshift({
                    tablett: this.tablett,
                    verwendet: this.verwendet
                });
            }
            Object.assign(this.$data, data(null, this.selectedTheme));
        }
    }
});

new Vue({
    el: '#app',
    data() {
        return {
            themes,
            selectedTheme: 0,
            running: false,
        };
    },
    methods: {
        reset() {
            this.running = false;
            this.$refs.game.reset(true);
        }
    }
});


new Vue();

/**
 * @todo Lots of renaming and refactoring
 */