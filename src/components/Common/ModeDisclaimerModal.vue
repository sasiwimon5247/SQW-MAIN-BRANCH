<template>
  <div class="mode-disclaimer-box">
    <div class="mode-disclaimer-icon">⚠️</div>
    <div class="mode-disclaimer-text">
      ข้อมูลนี้เพื่อใช้แสดงสภาพพื้นที่ตำแหน่งแปลงที่ดิน<br />
      และแปลงข้างเคียงร่วมกับ Google Maps เท่านั้น<br />
      <strong>ไม่ใช่หลักฐานที่ใช้ในทางกฏหมาย</strong><br />
    </div>
    <div style="text-align:center; margin-top:12px">
      <button class="btn btn-primary" @click="$emit('accept')">
        รับทราบ
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModeDisclaimerModal",
};
</script>

<style>
@import "../../styles/app.css";
</style>