<template>
  <!-- Map Control Buttons -->
  <div class="map-controls">
    <!-- Search Button -->
    <button
      class="control-btn search-btn"
      @click="onToggleSearch"
      title="Search"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </button>

    <!-- Filters Button -->
    <button
      class="control-btn filter-btn"
      @click="onToggleFilters"
      title="Filters"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
      </svg>
    </button>

    <!-- P2P Chat Button -->
    <button
      class="control-btn p2p-btn"
      :class="{ 'has-notification': hasNewMessage }"
      @click="onToggleP2P"
      title="P2P Chat"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        />
      </svg>
      <span v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount }}
      </span>
    </button>
  </div>
</template>

<script>
export default {
  name: "MapContainer",
  props: {
    hasNewMessage: {
      type: Boolean,
      default: false,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["toggle-search", "toggle-filters", "toggle-p2p"],
  methods: {
    onToggleSearch() {
      this.$emit("toggle-search");
    },
    onToggleFilters() {
      this.$emit("toggle-filters");
    },
    onToggleP2P() {
      this.$emit("toggle-p2p");
    },
  },
};
</script>

<style>
@import "../../styles/app.css";
</style>
