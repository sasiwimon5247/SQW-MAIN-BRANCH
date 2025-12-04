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