<template>
  <!-- Navigation Buttons -->
  <div class="flex-container">
    <div class="dashboard land-plots">
      <span class="dashboard-number"
        >{{ dashboard.plots.toLocaleString() }}
        <span class="highlight">ประกาศ</span></span
      >
      <div class="dashboard-label">ที่ดินทั้งหมด</div>
    </div>
    <div class="dashboard area">
      <span class="dashboard-number"
        >{{ fmt2(dashboard.areaRai)
        }}<span class="highlight"> ไร่</span></span
      >
      <div class="dashboard-label">จำนวนรวม</div>
    </div>
    
    <div class="dashboard value">
            <span class="dashboard-number">{{
              fmt(dashboard.totalValueMillion)
            }}</span>
            <div class="dashboard-label">
              <span class="highlight">ล้านบาท</span>
            </div>
            <div class="dashboard-label">มูลค่าที่ดินรวม</div>
          </div>
        </div>
</template>

<script src="../../app-script2.js"></script>
<style>@import "../../styles/app.css";</style>