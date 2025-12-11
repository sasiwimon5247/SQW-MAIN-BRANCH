<template>
    <!-- Search Panel -->
      <div class="search-panel" v-show="showSearch">
        <div class="panel-header">
          <h3>ค้นหา</h3>
          <button @click="showSearch = false" class="close-btn">×</button>
        </div>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="พิมพ์ชื่อสถานที่ หรือ 13.7563, 100.5018 (ปล่อยว่างเพื่อใช้ GPS)"
          class="search-input"
        />

        <button @click="performSearch" class="btn btn-primary">ค้นหา</button>

        <button
          @click="locateByGPS"
          class="btn btn-outline-secondary"
          style="margin-left: 8px"
        >
          ใช้ตำแหน่งฉัน (GPS)
        </button>
      </div>
</template>

<script src="../../app-script2.js"></script>
<style>@import "../../styles/app.css";</style>