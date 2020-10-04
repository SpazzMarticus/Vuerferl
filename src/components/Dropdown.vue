<template>
  <div>
    <slot name="portalBefore"></slot>
    <div v-if="!hide && !isOpen">
      <button class="button" @click="isOpen = true">
        <slot name="button"></slot>
      </button>
    </div>
    <div v-if="!hide && isOpen">
      <slot name="drop"></slot>
    </div>
    <slot name="portalAfter"></slot>
  </div>
</template>

<script>
export default {
  props: {
    hide: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    close() {
      this.isOpen = false;
    },
  },
};
</script>