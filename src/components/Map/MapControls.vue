<template>
  <div
    class="control-section"
    style="
      margin-top: 8px;
      background: #fff1;
      padding: 8px;
      border-radius: 8px;
    "
  >
    <div>
      <button @click="addBangkokOverlay('bma2556')">ผังเมือง กทม. 2556</button>
      <button @click="addBangkokOverlay('bma2570_draft')">
        ผังเมือง กทม. 2570 (ร่าง)
      </button>
      <button @click="clearBangkokOverlay">ซ่อนผังเมือง</button>

      <label class="checkbox-label">Opacity (ผัง กทม.)</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="kmlOpacity"
        @input="setBangkokOverlayOpacity($event.target.value)"
      />
      <span style="font-size: 12px">{{ kmlOpacity.toFixed(2) }}</span>
    </div>

    <label class="checkbox-label" style="margin-top: 8px">
      <input type="checkbox" :checked="dolEnabled" @change="onToggleDol" />
      <span class="checkmark">{{ dolEnabled ? '✓' : '' }}</span>
      ระวางกรมที่ดินสีแดง
    </label>
    <div class="opacity-control" v-if="dolEnabled">
      <label class="checkbox-label">Opacity</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="dolOpacity"
        class="slider"
        @input="onChangeDolOpacity($event.target.value)"
      />
      <span class="opacity-value">{{ dolOpacity.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script src="../../app-script2.js"></script>
<style>@import "../../styles/app.css";</style>