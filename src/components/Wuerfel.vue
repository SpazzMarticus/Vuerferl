<template>
  <div
    @click="click"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
    class="wuerfel"
  >
    <svg viewBox="0 0 100 100" :fill="color" :opacity="toBeRemoved ? 0.5 : 1">
      <defs>
        <linearGradient id="corners1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop
            offset="0%"
            style="stop-color: rgb(0, 0, 0); stop-opacity: 0.25"
          />
          <stop
            offset="100%"
            style="stop-color: rgb(255, 255, 255); stop-opacity: 0.25"
          />
        </linearGradient>
        <linearGradient id="corners1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset="0%"
            style="stop-color: rgb(0, 0, 0); stop-opacity: 0.25"
          />
          <stop
            offset="100%"
            style="stop-color: rgb(255, 255, 255); stop-opacity: 0.25"
          />
        </linearGradient>
      </defs>
      <g>
        <!-- face -->
        <rect x="0" y="0" width="100" height="100" rx="12" :fill="color" />
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx="12"
          fill="url(#corners1)"
        />
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx="12"
          fill="url(#corners2)"
        />
        <circle cx="50" cy="50" r="48" :fill="color" :opacity="faceOpacity" />
      </g>
      <g>
        <!-- pips -->

        <!-- center -->
        <circle
          r="8"
          cx="50"
          cy="50"
          :fill="pipColor"
          v-if="value === 1 || value === 3 || value === 5"
        />

        <!-- top-right and bottom-left -->
        <circle
          r="8"
          cx="31"
          cy="70"
          :fill="pipColor"
          v-if="value === 2 || value === 3 || value === 4 || value === 5"
        />
        <circle
          r="8"
          cx="69"
          cy="30"
          :fill="pipColor"
          v-if="value === 2 || value === 3 || value === 4 || value === 5"
        />

        <!-- top-left and bottom-right -->
        <circle
          r="8"
          cx="31"
          cy="30"
          :fill="pipColor"
          v-if="value === 4 || value === 5"
        />
        <circle
          r="8"
          cx="69"
          cy="70"
          :fill="pipColor"
          v-if="value === 4 || value === 5"
        />

        <!-- six -->
        <circle r="8" cx="31" cy="25" :fill="pipColor" v-if="value === 6" />
        <circle r="8" cx="31" cy="50" :fill="pipColor" v-if="value === 6" />
        <circle r="8" cx="31" cy="75" :fill="pipColor" v-if="value === 6" />
        <circle r="8" cx="69" cy="25" :fill="pipColor" v-if="value === 6" />
        <circle r="8" cx="69" cy="50" :fill="pipColor" v-if="value === 6" />
        <circle r="8" cx="69" cy="75" :fill="pipColor" v-if="value === 6" />
      </g>
    </svg>
  </div>
</template>

<script>
export default {
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
    mouseEvents: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    faceOpacity() {
      return this.pipColor === "#ffffff" ? 0.7 : 0.4;
    },
  },
  methods: {
    click() {
      if (this.mouseEvents) {
        this.$emit("click");
      }
    },
    mouseover() {
      if (this.mouseEvents) {
        this.$emit("mouseover");
      }
    },
    mouseleave() {
      if (this.mouseEvents) {
        this.$emit("mouseleave");
      }
    },
  },
};
</script>