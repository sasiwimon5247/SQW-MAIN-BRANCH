<template>
  <!-- Search Panel -->
  <div class="search-panel" v-show="showSearch">
    <div class="panel-header">
      <h3>ค้นหา</h3>
      <!-- ให้ parent เป็นคนปิด -->
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>

    <input
      type="text"
      :value="searchQuery"
      @input="$emit('update:searchQuery', $event.target.value)"
      placeholder="พิมพ์ชื่อสถานที่ หรือ 13.7563, 100.5018 (ปล่อยว่างเพื่อใช้ GPS)"
      class="search-input"
    />

    <button @click="$emit('search')" class="btn btn-primary">
      ค้นหา
    </button>

    <button
      @click="$emit('locate-gps')"
      class="btn btn-outline-secondary"
      style="margin-left: 8px"
    >
      ใช้ตำแหน่งฉัน (GPS)
    </button>
  </div>
</template>

<script>
export default {
  name: "SearchPanel",
  props: {
    showSearch: {
      type: Boolean,
      default: false,
    },
    searchQuery: {
      type: String,
      default: "",
    },
  },
  emits: ["close", "search", "locate-gps", "update:searchQuery"],
};
</script>

<style>
@import "../../styles/app.css";
</style>
