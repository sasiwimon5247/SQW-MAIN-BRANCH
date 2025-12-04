export default {
    methods: {

    acceptModeDisclaimer() {
      // Dismiss the modal; user has acknowledged the notice
      this.showModeDisclaimerModal = false;
    },

    acceptDisclaimer() {
      this.showDisclaimer = false;
      localStorage.setItem("ackDisclaimer", "yes");
    },

    closeDisclaimerOnce() {
      // แค่ปิดครั้งนี้ (ไม่จำค่า)
      this.showDisclaimer = false;
    },

    // ล็อก scroll ตอน popup เปิด
    showDisclaimer(val) {
      document.body.style.overflow = val ? "hidden" : "";
    },

    }
}