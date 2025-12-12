<!-- <script>
  export default {
    methods: {

    selectMode(mode) {
      this.currentMode = mode;
      // Show the centered disclaimer modal after mode selection
      this.showModeDisclaimerModal = true;
    },
    
    backToModeSelect() {
      this.currentMode = null;
    }

    }
}
</script> -->

<script src="../../app-script2.js"></script>
<style>@import "../../styles/app.css";</style>


<template>
  <!-- หน้าเลือกโหมด (ขึ้นเมื่อเปิดครั้งแรก)-->
  <h2>เลือกโหมดการใช้งาน</h2>
  <p>กรุณาเลือกประเภทการใช้งานระบบจัดการที่ดิน</p>

  <div class="mode-buttons">
    <button class="mode-btn sale" @click="selectMode('sale')">
      🏡 ระบบซื้อขายที่ดิน
    </button>
    <button class="mode-btn pledge" @click="selectMode('pledge')">
      🤝 ระบบขายฝากที่ดิน
    </button>
  </div>
</template>
