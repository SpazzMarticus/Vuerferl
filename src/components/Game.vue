
<template>
  <div>
    <div class="play-area">
      <div class="selected">
        <div class="dice-container">
          <div v-for="wuerfel in verwendet" :key="wuerfel.color">
            <wuerfel
              :color="wuerfel.color"
              :pip-color="wuerfel.pipColor"
              :value="wuerfel.value"
            >
            </wuerfel>
          </div>
          <div
            v-for="index in 3 - verwendet.length"
            :key="'e' + index"
            class="wuerfel wuerfel-empty"
          ></div>
        </div>
      </div>
      <div class="table">
        <dropdown
          class="button-container"
          ref="actions"
          :hide="!actionAvailable"
        >
          <template v-slot:portalBefore>
            <div>
              <button
                class="button"
                @click="
                  closeDropdown();
                  wurf();
                "
                v-show="wurfErforderlich"
                :disabled="wurfInProgress"
              >
                <img src="assets/img/rolling-dice-cup.svg" class="icon" />
                Roll
              </button>
            </div>
          </template>
          <template v-slot:button> Actions... </template>
          <template v-slot:drop>
            <button
              class="button"
              @click="
                closeDropdown();
                wurf();
              "
              v-show="actionAvailableReroll"
              :disabled="wurfInProgress"
            >
              <img src="assets/img/cycle.svg" class="icon" />
              Reroll
            </button>
            <button
              class="button"
              v-if="actionAvailableReuse"
              @click="
                closeDropdown();
                reuseActive = true;
              "
            >
              <img src="assets/img/return-dice.svg" class="icon" />
              Reuse
            </button>
            <button
              class="button"
              v-if="actionAvailableDiscard"
              @click="
                closeDropdown();
                discard();
              "
            >
              <img src="assets/img/trash-can.svg" class="icon" />
              Discard
            </button>
            <button class="button" @click="closeDropdown">X</button>
          </template>
          <template v-slot:portalAfter>
            <div class="right">
              <button
                class="button"
                @click="reset(false)"
                v-show="resetErforderlich"
              >
                <img src="assets/img/player-next.svg" class="icon" />
                Next player
              </button>
            </div>
          </template>
        </dropdown>

        <div class="dice-container" :class="{ usable: !wurfErforderlich }">
          <wuerfel
            v-for="(wuerfel, index) in tisch"
            :key="index"
            :color="wuerfel.color"
            :pip-color="wuerfel.pipColor"
            :value="wuerfel.value"
            :to-be-removed="
              !wurfErforderlich && hoverValue && wuerfel.value < hoverValue
            "
            :mouse-events="!wurfErforderlich"
            @click="
              closeDropdown();
              verwenden(wuerfel);
            "
            @mouseover="hoverWuerfel(wuerfel)"
            @mouseleave="hoverWuerfel(null)"
          >
          </wuerfel>
        </div>
      </div>
      <div class="tray">
        <div class="center" v-if="reuseActive">Select dice to reuse.</div>
        <div class="dice-container" :class="{ usable: reuseActive }">
          <wuerfel
            v-for="(wuerfel, index) in tablett"
            :key="index"
            :color="wuerfel.color"
            :pip-color="wuerfel.pipColor"
            :value="wuerfel.value"
            :mouse-events="reuseActive"
            @click="
              closeDropdown();
              reuse(wuerfel);
            "
          >
          </wuerfel>
        </div>
      </div>
    </div>

    <div class="log" v-if="log.length > 0">
      <div v-for="(entry, index) in log" class="log-entry" :key="index">
        <div class="index">#{{ log.length - index }}</div>
        <div
          v-for="(wuerfel, index) in entry.verwendet"
          :key="'s' + index"
          class="selected"
        >
          <wuerfel
            :color="wuerfel.color"
            :pip-color="wuerfel.pipColor"
            :value="wuerfel.value"
          >
          </wuerfel>
        </div>
        <div
          v-for="(wuerfel, index) in entry.tablett"
          :key="'t' + index"
          class="tray"
        >
          <wuerfel
            :color="wuerfel.color"
            :pip-color="wuerfel.pipColor"
            :value="wuerfel.value"
          >
          </wuerfel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Dropdown from "./Dropdown.vue";
import Vuerfel from "./Wuerfel.vue";
import diceRoll from "../modules/dice";

const rollTimeout = 77;
const rollCount = 3;

function Wuerfel(color, pipColor) {
  this.value = diceRoll();
  this.color = color;
  this.pipColor = pipColor;
  this.rolling = true;
  this.roll = () => {
    const interval = setInterval(() => {
      this.value = diceRoll();
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

const log = [];

const data = function (vue, selectedTheme) {
  return {
    pristine: true,
    tisch: [],
    tablett: [],
    verwendet: [],
    wuerfelVerwendet: true,
    wurfInProgress: false,
    // resetErforderlich: false,
    selectedTheme,
    log,
    hoverValue: null,
    reuseActive: false,
    reuseUsed: false,
  };
};

export default {
  components: { wuerfel: Vuerfel, Dropdown },
  props: {
    theme: {
      required: true,
      type: Object,
    },
  },
  data,
  computed: {
    resetErforderlich() {
      return (
        !this.pristine &&
        (this.verwendet.length === 3 || this.tisch.length === 0)
      );
    },
    wurfErforderlich() {
      return (
        !this.resetErforderlich &&
        (this.wuerfelVerwendet || this.reuseUsed || this.tisch.length === 0)
      );
    },
    actionAvailableReroll() {
      return !this.wurfErforderlich && this.tisch.length > 0;
    },
    actionAvailableDiscard() {
      return this.tisch.length > 0;
    },
    actionAvailableReuse() {
      return (
        this.tablett.length > 0 &&
        !this.actionAvailableReroll &&
        this.verwendet.length < 3
      );
    },
    actionAvailable() {
      return (
        this.actionAvailableReroll ||
        this.actionAvailableDiscard ||
        this.actionAvailableReuse
      );
    },
  },
  methods: {
    tischFuellen() {
      this.tisch = [
        new Wuerfel(this.theme.colors[0].color, this.theme.colors[0].pipColor),
        new Wuerfel(this.theme.colors[1].color, this.theme.colors[1].pipColor),
        new Wuerfel(this.theme.colors[2].color, this.theme.colors[2].pipColor),
        new Wuerfel(this.theme.colors[3].color, this.theme.colors[3].pipColor),
        new Wuerfel(this.theme.colors[4].color, this.theme.colors[4].pipColor),
        new Wuerfel(this.theme.colors[5].color, this.theme.colors[5].pipColor),
      ];
    },
    closeDropdown() {
      this.$refs.actions.close();
    },
    wurf() {
      this.pristine = false;
      this.reuseUsed = false;
      this.wurfInProgress = true;
      if (!this.tisch.length) {
        this.tischFuellen();
      } else {
        this.tisch = this.tisch.map((wuerfel) => {
          return new Wuerfel(wuerfel.color, wuerfel.pipColor);
        });
      }

      this.wuerfelVerwendet = false;
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
      if (this.wuerfelVerwendet) {
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

        // this.resetErforderlich = true;
      } else if (this.tisch.length) {
        //Falls Tisch nicht leer, Wurf erforderlich
        this.wuerfelVerwendet = true;
      } else {
        // this.resetErforderlich = true;
      }
      this.hoverValue = null; //Zurücksetzen
    },
    /**
     * Move all remaining dice from table to tray
     * (Special case, if player can not use another dice.)
     */
    discard() {
      this.tablett.push(...this.tisch);
      this.tisch = [];
      // this.resetErforderlich = true;
    },
    reuse(wuerfel) {
      const index = this.tablett.indexOf(wuerfel);
      this.tablett.splice(index, 1);
      this.tisch.push(wuerfel);
      this.reuseUsed = true;
      this.reuseActive = false;
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
          verwendet: this.verwendet,
        });
      }
      Object.assign(this.$data, data(null, this.selectedTheme));
    },
  },
};
</script>