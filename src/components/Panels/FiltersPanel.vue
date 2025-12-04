<template>
  <!-- Filters Panel -->
  <div class="filters-panel" v-show="showFilters">
    <div class="panel-header">
      <h3>ตัวกรอง</h3>
      <button @click="showFilters = false" class="close-btn">×</button>
    </div>
    <div class="filter-group">
      <label>ขนาดถนน</label>
      <!-- สำคัญ: ให้ v-model ชี้ที่ filters.roadWidth -->
      <select v-model="filters.roadWidth" class="form-select">
        <option value="">ทั้งหมด</option>
        <option value="lt6">ต่ำกว่า 6 เมตร</option>
        <option value="6-9.99">ตั้งแต่ 6–9.99 เมตร</option>
        <option value="ge10">ตั้งแต่ 10 เมตรขึ้นไป</option>
        <option value="ge18">ตั้งแต่ 18 เมตรขึ้นไป</option>
        <option value="ge30">30 เมตรขึ้นไป</option>
      </select>
    </div>
    <div class="form-group" style="display: flex; gap: 10px">
      <div class="filter-group">
        <label>ขนาดพื้นที่ (ตร.วา)</label>
        <div class="price-range">
          <input
            type="text"
            :value="formatNumber(filters.areaMin)"
            @input="filters.areaMin = unformatNumber($event.target.value)"
            placeholder="ต่ำสุด"
            class="price-input"
            style="width: 50%"
          />
          <input
            type="text"
            :value="formatNumber(filters.areaMax)"
            @input="filters.areaMax = unformatNumber($event.target.value)"
            placeholder="สูงสุด"
            class="price-input"
            style="width: 50%"
          />
        </div>
      </div>
      <div class="filter-group">
        <label>ขนาดพื้นที่ (ไร่)</label>
        <div class="price-range">
          <input
            type="text"
            :value="formatNumber(filters.areaMinRai)"
            @input="
              filters.areaMinRai = unformatNumber($event.target.value)
            "
            placeholder="ต่ำสุด"
            class="price-input"
            style="width: 50%"
          />
          <input
            type="text"
            :value="formatNumber(filters.areaMaxRai)"
            @input="
              filters.areaMaxRai = unformatNumber($event.target.value)
            "
            placeholder="สูงสุด"
            class="price-input"
            style="width: 50%"
          />
        </div>
      </div>
    </div>

    <div class="filter-group">
      <label>ช่วงราคา (บาท : ตร.วา)</label>
      <div class="price-range" style="display: flex; gap: 10px">
        <input
          type="text"
          :value="formatNumber(filters.priceMin)"
          @input="filters.priceMin = unformatNumber($event.target.value)"
          placeholder="ต่ำสุด"
          class="price-input"
          style="width: 50%"
        />
        <input
          type="text"
          :value="formatNumber(filters.priceMax)"
          @input="filters.priceMax = unformatNumber($event.target.value)"
          placeholder="สูงสุด"
          class="price-input"
          style="width: 50%"
        />
      </div>
    </div>
    <div class="filter-group">
      <label>ช่วงราคา (รวมทั้งแปลง)</label>
      <div class="price-range" style="display: flex; gap: 10px">
        <input
          type="text"
          :value="formatNumber(filters.totalPriceMin)"
          @input="
            filters.totalPriceMin = unformatNumber($event.target.value)
          "
          placeholder="ต่ำสุด"
          class="price-input"
          style="width: 50%"
        />
        <input
          type="text"
          :value="formatNumber(filters.totalPriceMax)"
          @input="
            filters.totalPriceMax = unformatNumber($event.target.value)
          "
          placeholder="สูงสุด"
          class="price-input"
          style="width: 50%"
        />
      </div>
    </div>
    <div class="filter-group">
      <label>หน้ากว้างที่ดิน (เมตร)</label>
      <div class="price-range" style="display: flex; gap: 10px">
        <input
          type="text"
          :value="formatNumber(filters.frontMin)"
          @input="filters.frontMin = unformatNumber($event.target.value)"
          placeholder="ต่ำสุด"
          class="price-input"
          style="width: 50%"
        />
        <input
          type="text"
          :value="formatNumber(filters.frontMax)"
          @input="filters.frontMax = unformatNumber($event.target.value)"
          placeholder="สูงสุด"
          class="price-input"
          style="width: 50%"
        />
      </div>
    </div>

    <div class="flex gap-2">
      <button class="btn btn-primary" @click="applyFilters">
        ใช้ตัวกรอง
      </button>
      <button class="btn btn-secondary" @click="resetFilters">ล้าง</button>
    </div>
  </div>
</template>

<script src="./app-script2.js"></script>
<style>@import "./styles/app.css";</style>