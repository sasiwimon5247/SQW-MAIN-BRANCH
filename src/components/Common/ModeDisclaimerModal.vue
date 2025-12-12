<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <div class="modal-icon">⚠️</div>

      <p class="modal-text">
        ข้อมูลนี้เพื่อใช้แสดงสภาพพื้นที่ตำแหน่งแปลงที่ดิน<br />
        และแปลงจำแนกร่วมกับ Google Maps เท่านั้น<br />
        ไม่ใช่หลักฐานที่ใช้ในทางกฎหมาย
      </p>

      <button class="btn btn-primary" @click="confirm">
        รับทราบ
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModeDisclaimerModal",

  emits: ["close"],

  methods: {
    confirm() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
}

.modal-box {
  width: 420px;
  background: #fff;
  border-radius: 14px;
  padding: 28px;
  text-align: center;
}

.modal-icon {
  font-size: 42px;
  margin-bottom: 12px;
}

.modal-text {
  font-size: 16px;
  color: #b22222;
  margin-bottom: 20px;
  line-height: 1.6;
}

.btn {
  padding: 10px 22px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
