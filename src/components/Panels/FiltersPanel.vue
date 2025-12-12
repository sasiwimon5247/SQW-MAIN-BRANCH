<style>@import "../../styles/app.css";</style>

<script>
/* eslint-disable vue/no-mutating-props */
export default {
  name: "FiltersPanel",
  props: {
    showFilters: {
      type: Boolean,
      default: false,
    },
    // ให้ default เป็น {} เพื่อกันกรณี parent เผลอไม่ส่ง
    filters: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["apply", "reset", "close"],
};
</script>

<template>
  <!-- Filters Panel -->
  <div class="filters-panel" v-show="showFilters">
    <div class="panel-header">
      <h3>ตัวกรอง</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>

    <div class="filters-body">
      <!-- ตัวอย่างฟิลด์ สามารถเพิ่ม/ลดตามของเดิมได้เลย -->
      <div class="form-group">
        <label>ประเภทที่ดิน</label>
        <select class="form-input" v-model="filters.landType">
          <option value="">ทั้งหมด</option>
          <option value="chanote">โฉนด</option>
          <option value="nor_sor_3">นส.3 / นส.3ก</option>
        </select>
      </div>

      <div class="form-group">
        <label>ความกว้างถนน (เมตรขึ้นไป)</label>
        <input
          type="number"
          class="form-input"
          v-model="filters.roadWidth"
          placeholder="เช่น 6"
        />
      </div>

      <div class="form-group">
        <label>ขนาดที่ดินขั้นต่ำ (ตารางวา)</label>
        <input
          type="number"
          class="form-input"
          v-model="filters.areaMin"
          placeholder="เช่น 100"
        />
      </div>

      <div class="form-group">
        <label>ขนาดที่ดินสูงสุด (ตารางวา)</label>
        <input
          type="number"
          class="form-input"
          v-model="filters.areaMax"
          placeholder="เช่น 400"
        />
      </div>

      <div class="form-group">
        <label>ราคาต่อตารางวา ขั้นต่ำ</label>
        <input
          type="number"
          class="form-input"
          v-model="filters.priceMin"
          placeholder="เช่น 5000"
        />
      </div>

      <div class="form-group">
        <label>ราคาต่อตารางวา สูงสุด</label>
        <input
          type="number"
          class="form-input"
          v-model="filters.priceMax"
          placeholder="เช่น 15000"
        />
      </div>
    </div>

    <div class="panel-footer">
      <button class="btn btn-outline-secondary" @click="$emit('reset')">
        ล้างตัวกรอง
      </button>
      <button class="btn btn-primary" @click="$emit('apply')">
        ใช้ตัวกรอง
      </button>
    </div>
  </div>
</template>