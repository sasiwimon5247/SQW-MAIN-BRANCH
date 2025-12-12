<template>
  <!-- Navigation / Dashboard Row -->
  <div class="flex-container">
    <!-- จำนวนแปลง -->
    <div class="dashboard land-plots">
      <span class="dashboard-number">
        {{ fmtInt(dashboard.plots) }}
        <span class="highlight">ประกาศ</span>
      </span>
      <div class="dashboard-label">ที่ดินทั้งหมด</div>
    </div>

    <!-- จำนวนรวม (ไร่) -->
    <div class="dashboard area">
      <span class="dashboard-number">
        {{ fmtRai(dashboard.areaRai) }}
        <span class="highlight"> ไร่</span>
      </span>
      <div class="dashboard-label">จำนวนรวม</div>
    </div>

    <!-- มูลค่าที่ดินรวม (ล้านบาท) -->
    <div class="dashboard value">
      <span class="dashboard-number">
        {{ fmtMillion(dashboard.totalValueMillion) }}
      </span>
      <div class="dashboard-label">
        <span class="highlight">ล้านบาท</span>
      </div>
      <div class="dashboard-label">มูลค่าที่ดินรวม</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LandDashboard",

  props: {
    // รับ dashboard จาก App (computed dashboard() ใน app-script2.js)
    dashboard: {
      type: Object,
      default: () => ({
        plots: 0,
        areaRai: 0,
        totalValueMillion: 0,
      }),
    },
  },

  methods: {
    fmtInt(v) {
      if (v == null || Number.isNaN(v)) return "0";
      return Number(v).toLocaleString("th-TH", {
        maximumFractionDigits: 0,
      });
    },
    fmtRai(v) {
      if (v == null || Number.isNaN(v)) return "0";
      return Number(v).toLocaleString("th-TH", {
        maximumFractionDigits: 2,
      });
    },
    fmtMillion(v) {
      if (v == null || Number.isNaN(v)) return "0";
      return Number(v).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
  },
};
</script>

<style>
@import "../../styles/app.css";
</style>
