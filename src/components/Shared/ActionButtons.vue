<template>
  <!-- Action Buttons -->
  <div class="action-buttons">
    <button class="btn btn-info" @click="onStartDrawing">
      เริ่มวาดขอบเขต
    </button>
    <button class="btn btn-success" @click="onFinishDrawing">
      Finish
    </button>
    <button class="btn btn-danger" @click="onClearDrawing">
      Clear
    </button>
  </div>
</template>

<script>
export default {
  name: "ActionButtons",
  emits: ["start-drawing", "finish-drawing", "clear-drawing"],
  methods: {
    onStartDrawing() {
      this.$emit("start-drawing");
    },
    onFinishDrawing() {
      this.$emit("finish-drawing");
    },
    onClearDrawing() {
      this.$emit("clear-drawing");
    },
  },
};
</script>

<style>
@import "../../styles/app.css";
</style>
