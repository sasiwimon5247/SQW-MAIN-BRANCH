<template>
    <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn btn-info" @click="startDrawing">
            เริ่มวาดขอบเขต
          </button>
          <button class="btn btn-success" @click="finishDrawing">Finish</button>
          <button class="btn btn-danger" @click="clearDrawing">Clear</button>
        </div>
</template>

<script src="./app-script2.js"></script>

<style>@import "./styles/app.css";</style>