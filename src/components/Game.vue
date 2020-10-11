<template>
  <div>
    <div v-if="round <= roundCount">
      <div class="game-info">
        <p class="player" v-if="playerCount > 1">
          Player&nbsp;<strong>{{ activePlayer }}</strong>
        </p>
        <p class="round">Round&nbsp;<strong>{{ round }}/{{ roundCount }}</strong></p>
      </div>
      <div class="play-area">
        <div class="selected">
          <div class="dice-container">
            <div v-for="wuerfel in used" :key="wuerfel.color">
              <wuerfel
                :color="wuerfel.color"
                :pip-color="wuerfel.pipColor"
                :value="wuerfel.value"
              >
              </wuerfel>
            </div>
            <div
              v-for="index in 3 - used.length"
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
                    roll();
                  "
                  v-show="rollRequired"
                  :disabled="rollInProgress"
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
                  roll();
                "
                v-show="actionAvailableReroll"
                :disabled="rollInProgress"
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

          <div class="dice-container" :class="{ usable: actionAvailableUse }">
            <wuerfel
              v-for="(wuerfel, index) in tisch"
              :key="index"
              :color="wuerfel.color"
              :pip-color="wuerfel.pipColor"
              :value="wuerfel.value"
              :to-be-removed="
                actionAvailableUse && hoverValue && wuerfel.value < hoverValue
              "
              :mouse-events="actionAvailableUse"
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
              v-for="(wuerfel, index) in tray"
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
    </div>
    <div v-else class="end-game">The End</div>

    <div class="log" :class="{single:playerCount===1}" v-if="log.length > 0">
      <div v-for="(entry, index) in log" class="log-entry" :key="index">
        <div class="index">#{{ log.length - index }}</div>
        <div class="index" v-if="playerCount > 1">
          <img class="icon" src="assets/img/person.svg" />
          {{ ((log.length - 1 - index) % playerCount) + 1 }}
        </div>
        <div
          v-for="(wuerfel, index) in entry.used"
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
          v-for="(wuerfel, index) in entry.tray"
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
  this.roll();
}

const log = [];

const data = function (vue, activePlayer = 1) {
  return {
    /**
     * dice
     */
    tisch: [],
    tray: [],
    used: [],
    /**
     * state
     */
    pristine: true,
    diceUsed: true,
    rollInProgress: false,
    hoverValue: null,
    reuseActive: false,
    reuseUsed: false,
    activePlayer,
    /**
     * log-entries
     */
    log,
  };
};

export default {
  components: { wuerfel: Vuerfel, Dropdown },
  props: {
    theme: {
      required: true,
      type: Object,
    },
    playerCount: {
      required: true,
      type: Number,
    },
  },
  data,
  computed: {
    resetErforderlich() {
      return (
        !this.pristine && (this.used.length === 3 || this.tisch.length === 0)
      );
    },
    rollRequired() {
      return (
        !this.resetErforderlich &&
        (this.diceUsed || this.reuseUsed || this.tisch.length === 0)
      );
    },
    actionAvailableUse() {
      return !this.rollRequired;
    },
    actionAvailableReroll() {
      return !this.rollRequired && this.tisch.length > 0;
    },
    actionAvailableDiscard() {
      return this.tisch.length > 0;
    },
    actionAvailableReuse() {
      return (
        this.tray.length > 0 &&
        !this.actionAvailableReroll &&
        this.used.length < 3
      );
    },
    actionAvailable() {
      return (
        this.actionAvailableReroll ||
        this.actionAvailableDiscard ||
        this.actionAvailableReuse
      );
    },
    round() {
      return Math.floor(this.log.length / this.playerCount) + 1;
    },
    roundCount() {
      return this.playerCount > 2 ? (this.playerCount > 3 ? 4 : 5) : 6;
    },
  },
  methods: {
    fillTable() {
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
    roll() {
      this.pristine = false;
      this.reuseActive = false;
      this.reuseUsed = false;
      this.rollInProgress = true;
      if (!this.tisch.length) {
        this.fillTable();
      } else {
        this.tisch = this.tisch.map((wuerfel) => {
          return new Wuerfel(wuerfel.color, wuerfel.pipColor);
        });
      }

      this.diceUsed = false;
      this.sortTable();
    },
    sortTable() {
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
        this.rollInProgress = false;
      }, rollTimeout * rollCount);
    },
    verwenden(ausgewaehlterWuerfel) {
      //While dice are rolling, don't use them
      if (ausgewaehlterWuerfel.rolling) {
        console.log("rolling");
        return;
      }
      //Vor der Verwendung muss gewürfelt werden
      if (this.diceUsed) {
        console.log("used");
        return;
      }
      //Move selected dice to used-area and remaining dice with less pips to tray
      this.tisch = this.tisch.reduce((tisch, wuerfel) => {
        if (wuerfel === ausgewaehlterWuerfel) {
          this.used.push(wuerfel);
        } else if (wuerfel.value < ausgewaehlterWuerfel.value) {
          this.tray.push(wuerfel);
        } else {
          tisch.push(wuerfel);
        }
        return tisch;
      }, []);

      if (this.used.length >= 3) {
        //Move remaining dice to tray and empty table
        this.tray.push(...this.tisch);
        this.tisch = [];
      } else if (this.tisch.length) {
        //If table not empty, roll required
        this.diceUsed = true;
      }
      this.hoverValue = null; //Reset
    },
    /**
     * Move all remaining dice from table to tray
     * (Special case, if player can not use another dice.)
     */
    discard() {
      this.tray.push(...this.tisch);
      this.tisch = [];
    },
    /**
     * Move dice from tray back to table
     * (Special action)
     */
    reuse(wuerfel) {
      const index = this.tray.indexOf(wuerfel);
      this.tray.splice(index, 1);
      this.tisch.push(wuerfel);
      this.reuseUsed = true;
      this.reuseActive = false;
    },
    /**
     * Hovering dice (on table) shows which are removed by selecting one
     */
    hoverWuerfel(wuerfel) {
      this.hoverValue = wuerfel ? wuerfel.value : null;
    },
    /**
     * Reset component
     * (Hard reset empties log and reset active player)
     */
    reset(hard = false) {
      if (hard) {
        this.log.length = 0; //Empty array without creating a new instance
        this.activePlayer = 1;
      } else {
        this.log.unshift({
          tray: this.tray,
          used: this.used,
        });
        //Calculate player count
        this.activePlayer++;
        if (this.activePlayer > this.playerCount) {
          this.activePlayer = 1;
        }
      }

      Object.assign(this.$data, data(null, this.activePlayer));
    },
  },
};
</script>