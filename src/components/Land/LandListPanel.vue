<style>@import "../../styles/app.css";</style>

<script>
export default {
  name: "LandListPanel",

  props: {
    // รายการแปลงจาก App (savedLands ใน app-script2.js)
    savedLands: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["focus", "delete"],

  data() {
    return {
      isListOpen: true,
    };
  },

  methods: {
    // แสดงชื่อ: ถ้ามีนายหน้าให้โชว์ "ชื่อนายหน้า (นายหน้า)"
    displayOwner(land) {
      if (land.agent && land.agent.trim()) {
        return `${land.agent} (นายหน้า)`;
      }
      if (land.owner && land.owner.trim()) {
        return land.owner;
      }
      return "ไม่ระบุ";
    },

    // format ตัวเลขให้มีคอมมา
    formatNumber(value) {
      if (value == null || value === "") return "0";
      const num = Number(String(value).replace(/,/g, ""));
      if (!Number.isFinite(num)) return String(value);
      return num.toLocaleString();
    },

    // กดเลือกแปลง → ให้ App ไป focus บนแผนที่
    onFocusLand(land) {
      this.$emit("focus", land);
    },

    // กดลบแปลง → ให้ App ไปเรียก deleteLandItem จริง
    onDeleteLand(id) {
      this.$emit("delete", id);
    },
  },
};
</script>
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
          :key="land.id || index"
          class="land-item"
        >
          <div class="land-owner" @click="onFocusLand(land)">
            {{ displayOwner(land) }}
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
            @click="onDeleteLand(land.id)"
          >
            ลบแปลง
          </button>
        </div>
      </div>
      <div v-else class="no-data">ยังไม่มีข้อมูลแปลง</div>
    </div>
  </transition>
</template>

