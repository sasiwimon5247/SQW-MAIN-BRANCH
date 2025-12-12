<!-- <script>
  import * as turf from "@turf/turf";
  export default {
    methods: {

    // ค่ารวมบน Dashboard (ใช้รายการที่กรองแล้ว ถ้าไม่มีใช้ทั้งหมด)
    dashboard() {
      const arr = (this.filteredLands?.length ? this.filteredLands : this.savedLands) || [];

      const plots = arr.length;

      // นับเจ้าของ (fallback: ownerUid > owner > agent)
      const owners = new Set(
        arr.map(it => it.ownerUid || (it.owner || '').trim() || (it.agent || '').trim())
          .filter(Boolean)
      ).size;

      // พื้นที่รวมจาก size (ตร.วา) หรือ area → แปลงเป็น "ไร่"
      const areaSqw = arr.reduce((s, it) => {
        const v = Number(it.size ?? it.area);
        return s + (Number.isFinite(v) ? v : 0);
      }, 0);
      const areaRai = areaSqw / 400;

      // มูลค่ารวม: ใช้ totalPrice ถ้ามี ไม่งั้น pricePerSqw*size
      const totalValue = arr.reduce((s, it) => {
        const tot = Number(it.totalPrice);
        if (Number.isFinite(tot) && tot > 0) return s + tot;
        const p = Number(it.pricePerSqw ?? it.price);
        const sz = Number(it.size ?? it.area);
        return s + (Number.isFinite(p) && Number.isFinite(sz) ? p * sz : 0);
      }, 0);

      return {
        plots,
        owners,
        areaRai,
        totalValue,
        totalValueMillion: totalValue / 1e6,
      };
    },
    // ====== ตรวจสอบแปลงที่ดินอยู่ในเขตน้ำท่วมระดับใด ======
    async checkLandsFloodStatus() {
      const lands = (this.filteredLands?.length ? this.filteredLands : this.savedLands) || [];
      const floods = Array.isArray(this.savedFloods) ? this.savedFloods : [];

      const result = { low: 0, medium: 0, high: 0, none: 0 };
      if (!lands.length) { this.floodSummary = result; return; }

      // เตรียม polygon ของน้ำท่วม (ปิดห่วงถ้ายังไม่ปิด)
      const floodPolys = floods
        .filter(f => f?.geometry?.type === "Polygon" && Array.isArray(f.geometry.coordinates))
        .map(f => {
          let ring = f.geometry.coordinates.slice();
          if (ring.length >= 3) {
            const first = ring[0], last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) ring = [...ring, first]; // ปิดห่วง
            try {
              return { level: f.level || "medium", poly: turf.polygon([ring]) };
            } catch { return null; }
          }
          return null;
        })
        .filter(Boolean);

      const levelOrder = { low: 0, medium: 1, high: 2 };

      for (const land of lands) {
        // หาจุดแทนแปลง: centroid ของ polygon หรือ location
        let pt = null;
        try {
          if (land.geometry?.type === "Polygon" && Array.isArray(land.geometry.coordinates)) {
            const ring = land.geometry.coordinates;
            pt = turf.centroid(turf.polygon([ring]));
          } else if (land.location && typeof land.location.lon === "number" && typeof land.location.lat === "number") {
            pt = turf.point([land.location.lon, land.location.lat]);
          }
        } catch { /* ignore */ }
        if (!pt) { result.none++; continue; }

        // เช็คว่าอยู่ในโซนใด (ถ้าอยู่หลายโซนเอาที่ระดับสูงกว่า)
        let best = null;
        for (const f of floodPolys) {
          try {
            if (turf.booleanPointInPolygon(pt, f.poly)) {
              if (!best || levelOrder[f.level] > levelOrder[best]) best = f.level;
            }
          } catch { /* ignore */ }
        }
        if (!best) result.none++; else result[best]++;
      }

      this.floodSummary = result;
    },

    recomputeFloodSummary() {
      this.floodSummary = this._calcFloodSummary(this.lands || [], this._floodPolysCache || []);
    },
    _calcFloodSummary(lands, floodPolys) {
      const t = (window.turf || this.$turf);
      const order = { low: 0, medium: 1, high: 2 };
      const res = { low: 0, medium: 0, high: 0, none: 0 };

      lands.forEach(land => {
        let pt = null;
        if (land.geometry?.type === 'Polygon') pt = t.centroid(land.geometry);
        else if (land.location) pt = t.point([land.location.lon, land.location.lat]);
        if (!pt) return;

        let level = null;
        floodPolys.forEach(f => {
          if (t.booleanPointInPolygon(pt, f.poly)) {
            if (level == null || order[f.level] > order[level]) level = f.level;
          }
        });
        if (!level) res.none++; else res[level]++;
      });

      return res;
    },
    },


    watch: {
    savedLands: {
      handler() { this.checkLandsFloodStatus(); },
      deep: true
    },
    filteredLands: {
      handler() { this.checkLandsFloodStatus(); },
      deep: true
    },
    savedFloods: {
      handler() { this.checkLandsFloodStatus(); },
      deep: true
    },
    }
}
</script> -->

<style>@import "../../styles/app.css";</style>

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
