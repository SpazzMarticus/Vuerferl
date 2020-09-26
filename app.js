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
        :style="{'background-color':color,color:textColor,opacity:toBeRemoved?0.33:1}"
        >

        <svg viewBox="0 0 100 100">
            <!-- center -->
            <circle cx="50" cy="50" r="15" v-if="value === 1 || value === 3 || value === 5" :fill="textColor"/>

            <!-- top-left -->
            <circle cx="15" cy="15" r="15" v-if="value >= 4" :fill="textColor"/>

            <!-- bottom-right -->
            <circle cx="85" cy="85" r="15" v-if="value >= 4" :fill="textColor"/>

            <!-- top-right -->
            <circle cx="85" cy="15" r="15" v-if="value !== 1" :fill="textColor"/>

            <!-- bottom-left -->
            <circle cx="15" cy="85" r="15" v-if="value !== 1" :fill="textColor"/>

            <!-- middle-left -->
            <circle cx="15" cy="50" r="15" v-if="value === 6" :fill="textColor"/>

            <!-- middle-right -->
            <circle cx="85" cy="50" r="15" v-if="value === 6" :fill="textColor"/>
        </svg>
    </div>
    `,
    props: {
        color: {
            type: String,
            required: true,
        },
        textColor: {
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
});

const rollTimeout = 77;
const rollCount = 3;

function Wuerfel(color, textColor) {
    this.value = randomDiceValue();
    this.color = color;
    this.textColor = textColor;
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

var wuerfelErzeugen = function (color, textColor) {
    return new Wuerfel(color, textColor);
};

const themes = [
    {
        name: "Theme #1",
        colors: [
            { color: '#fec015', textColor: '#000000' }, //yellow
            { color: '#f37120', textColor: '#000000' }, //orange
            { color: '#653795', textColor: '#ffffff' }, //purple
            { color: '#0084cd', textColor: '#ffffff' }, //blue
            { color: '#00935c', textColor: '#ffffff' }, //green
            { color: '#ffffff', textColor: '#000000' }, //white
        ]
    },
    {
        name: "Theme #2",
        colors: [
            { color: '#fec015', textColor: '#000000' }, //yellow
            { color: '#dc6b96', textColor: '#000000' }, //pink
            { color: '#686a6a', textColor: '#ffffff' }, //gray
            { color: '#1e439c', textColor: '#ffffff' }, //blue
            { color: '#82c449', textColor: '#000000' }, //green
            { color: '#ffffff', textColor: '#000000' }, //white
        ]
    },
    {
        name: "Theme #3",
        colors: [
            { color: '#fec015', textColor: '#000000' }, //yellow
            { color: '#dc6b96', textColor: '#000000' }, //pink
            { color: '#653795', textColor: '#ffffff' }, //purple
            { color: '#0e8697', textColor: '#ffffff' }, //cyan
            { color: '#a86f3a', textColor: '#ffffff' }, //brown
            { color: '#ffffff', textColor: '#000000' }, //white
        ]
    },
];

const log = [];

var data = function (vue, selectedTheme = 0) {
    return {
        tisch: [],
        tablett: [],
        verwendet: [],
        wurfErforderlich: true,
        wurfInProgress: false,
        resetErforderlich: false,
        themeSelectable: true,
        selectedTheme,
        themes,
        log,
        hoverValue: null,
    };
}

new Vue({
    el: '#app',
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
                wuerfelErzeugen(this.themes[this.selectedTheme].colors[0].color, this.themes[this.selectedTheme].colors[0].textColor),
                wuerfelErzeugen(this.themes[this.selectedTheme].colors[1].color, this.themes[this.selectedTheme].colors[1].textColor),
                wuerfelErzeugen(this.themes[this.selectedTheme].colors[2].color, this.themes[this.selectedTheme].colors[2].textColor),
                wuerfelErzeugen(this.themes[this.selectedTheme].colors[3].color, this.themes[this.selectedTheme].colors[3].textColor),
                wuerfelErzeugen(this.themes[this.selectedTheme].colors[4].color, this.themes[this.selectedTheme].colors[4].textColor),
                wuerfelErzeugen(this.themes[this.selectedTheme].colors[5].color, this.themes[this.selectedTheme].colors[5].textColor),
            ];
        },

        wurf() {
            this.themeSelectable = false;
            this.wurfInProgress = true;
            if (!this.tisch.length) {
                this.tischFuellen();
            }
            else {
                this.tisch = this.tisch.map(wuerfel => {
                    return wuerfelErzeugen(
                        wuerfel.color,
                        wuerfel.textColor,
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
            if(ausgewaehlterWuerfel.rolling)
            {
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
                }
                else if (wuerfel.value < ausgewaehlterWuerfel.value) {
                    this.tablett.push(wuerfel);
                }
                else {
                    tisch.push(wuerfel);
                }
                return tisch;
            }, []);

            if (this.verwendet.length >= 3) {
                //Übrige Würfel auf Tablett legen und Tisch leeren
                this.tablett.push(...this.tisch);
                this.tisch = [];

                this.resetErforderlich = true;
            }
            else if (this.tisch.length) {
                //Falls Tisch nicht leer, Wurf erforderlich
                this.wurfErforderlich = true;
            }
            else {
                this.resetErforderlich = true;
            }
        },
        hoverWuerfel(wuerfel){
            this.hoverValue = wuerfel ? wuerfel.value : null;
        },
        reset(clearLog=false) {
            if (clearLog) {
                this.log.length = 0; //Empty array without creating a new instance
            }
            else {
                this.log.unshift({
                    tablett: this.tablett,
                    verwendet: this.verwendet
                });
            }
            Object.assign(this.$data, data(null, this.selectedTheme));
        }
    }

});

/**
 * @todo Lots of renaming and refactoring
 */