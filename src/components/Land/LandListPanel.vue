<template>
  <!-- รายการแปลง -->
  <h3 @click="isListOpen = !isListOpen" style="cursor: pointer">
    รายการแปลง
    <span v-if="isListOpen">▲</span>
    <span v-else>▼</span>
  </h3>

  <transition name="fade">
    <div v-show="isListOpen">
      <div class="form-subtitle">
        ข้อมูลรายการแปลงทั้งหมดของคุณ {{ savedLands.length }} แปลง
      </div>

      <div class="land-list" v-if="savedLands.length > 0">
        <div
          v-for="(land, index) in savedLands"
          :key="index"
          class="land-item"
        >
          <div class="land-owner" @click="focusLand(land)">
            {{ land.owner || land.agent + " (นายหน้า)" || "ไม่ระบุ" }}
          </div>
          <div class="land-details">
            {{ formatNumber(land.size) }} ตร.วา
          </div>
          <button
            style="
              margin-top: 6px;
              padding: 6px 10px;
              background: #e11d48;
              color: #fff;
              border: 0;
              border-radius: 6px;
            "
            @click="deleteLandItem(land.id)"
          >
            ลบแปลง
          </button>
        </div>
      </div>
      <div v-else class="no-data">ยังไม่มีข้อมูลแปลง</div>
    </div>
  </transition>
</template>

<script src="../../app-script2.js"></script>
<style>@import "../../styles/app.css";</style>