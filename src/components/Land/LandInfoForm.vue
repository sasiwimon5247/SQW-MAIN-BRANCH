<!-- <script>
  import {saveLand,} from "./firebase";

  export default {
    methods: {

    clearSelectedLand() {
      this.editingLandId = null;
      this.landData = {
        size: "", width: "", road: "", price: "", totalPrice: "",
        landFrame: "", deedInformation: "",
        owner: "", agent: "", phone: "", lineId: "", raiModel: "", nganModel: "", wahModel: "",
      };
      this.clearDrawing(); // เอา polygon highlight จากการเลือกก่อนหน้าออก
    },

    // ---- ใช้แทน formatPrice ที่หายไป ----
    formatMoney(v) {
      if (v == null || v === '') return '';
      const n = this.unformatDecimal(v);
      if (n == null) return '';
      return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },
    formatPrice(v) {           // รองรับ @blur="formatPrice(...)" ที่ template เรียกอยู่
      return this.formatMoney(v);
    },

    onPriceTyping(e) {
      const el = e.target;
      const clean = this.sanitizeDecimal(el.value); // ล้างคอมมาและตัวอื่น
      const num = this.unformatDecimal(clean);
      if (num == null || isNaN(num)) {
        this.landData.price = '';
        return;
      }

      // แสดงคอมมาทันทีระหว่างพิมพ์
      this.landData.price = num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });

      // คำนวณราคารวมระหว่างพิมพ์ด้วย
      this.syncPriceFromPerSqw();

      // จัด caret ให้อยู่ท้ายสุด (กันตำแหน่งกระโดด)
      this.$nextTick(() => {
        try {
          const pos = el.value.length;
          el.setSelectionRange(pos, pos);
        } catch (_) { }
      });
    },

    // === ราคารวม ↔ ราคาต่อตารางวา ===
    syncPriceFromPerSqw() {
      // คำนวณราคารวมจากราคาต่อตารางวา × ขนาดที่ดิน
      const pricePerSqw = parseFloat(this.unformatDecimal(this.landData.price)) || 0;
      const sizeSqw = parseFloat(this.unformatDecimal(this.landData.size)) || 0;
      if (sizeSqw > 0 && pricePerSqw >= 0) {
        const total = pricePerSqw * sizeSqw;
        this.landData.totalPrice = total.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      } else {
        this.landData.totalPrice = "";
      }
    },

    syncPerSqwFromTotal() {
      // คำนวณราคาต่อตารางวา จากราคารวม ÷ ขนาดที่ดิน
      const totalPrice = parseFloat(this.unformatDecimal(this.landData.totalPrice)) || 0;
      const sizeSqw = parseFloat(this.unformatDecimal(this.landData.size)) || 0;
      if (sizeSqw > 0 && totalPrice >= 0) {
        const perSqw = totalPrice / sizeSqw;
        this.landData.price = perSqw.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      } else {
        this.landData.price = "";
      }
    },


    sizeFromRaiNganWah(rai, ngan, wah) {
      const R = parseInt(String(rai ?? "").replace(/,/g, ""), 10);
      const N = parseInt(String(ngan ?? "").replace(/,/g, ""), 10);
      const W = parseFloat(String(wah ?? "").replace(/,/g, "")) || 0;
      const r = Number.isFinite(R) ? R : 0;
      const n = Number.isFinite(N) ? N : 0;
      const w = Number.isFinite(W) ? W : 0;
      return +(r * 400 + n * 100 + w).toFixed(2); // หน่วย: ตร.วา
    },

    rnwFromSize(sizeSqw) {
      const s = parseFloat(String(sizeSqw ?? "").replace(/,/g, ""));
      if (!Number.isFinite(s) || s < 0) return { rai: "", ngan: "", wah: "" };
      const rai = Math.floor(s / 400);
      const rem1 = s - rai * 400;
      const ngan = Math.floor(rem1 / 100);
      const wah = +(rem1 - ngan * 100).toFixed(2);
      return { rai, ngan, wah };
    },

    syncFromSize() {
      if (this._isSyncingSize) return;
      this._isSyncingSize = true;
      try {
        const { rai, ngan, wah } = this.rnwFromSize(this.landData.size);
        this.raiModel = (rai === "" ? "" : String(rai));
        this.nganModel = (ngan === "" ? "" : String(ngan));
        this.wahModel = (wah === "" ? "" : (this.fmt2 ? this.fmt2(wah) : wah.toFixed(2)));
      } finally {
        this._isSyncingSize = false;
      }
    },

    onRNWInput() {
      if (this._isSyncingSize) return;
      this._isSyncingSize = true;
      try {
        const sqw = this.sizeFromRaiNganWah(this.raiModel, this.nganModel, this.wahModel);
        // แสดงเป็นจำนวนเต็มถ้าลงตัว ไม่งั้นทศนิยม 2 ตำแหน่ง (ใช้ format ของคุณอยู่แล้ว)
        this.landData.size = Number.isInteger(sqw)
          ? sqw.toLocaleString()
          : sqw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } finally {
        this._isSyncingSize = false;
      }
    },

    normalizeRNW() {
      // บังคับช่วงค่ามาตรฐาน: งาน 0–3, วา 0–99.99 และทอนหน่วยให้ถูกต้องถ้าเกิน
      let r = parseInt(this.raiModel || 0, 10); r = Number.isFinite(r) ? r : 0;
      let n = parseInt(this.nganModel || 0, 10); n = Number.isFinite(n) ? n : 0;
      let w = parseFloat(this.wahModel || 0); w = Number.isFinite(w) ? w : 0;

      if (w >= 100) { n += Math.floor(w / 100); w = w % 100; }
      if (n >= 4) { r += Math.floor(n / 4); n = n % 4; }

      if (w < 0) w = 0; if (n < 0) n = 0; if (r < 0) r = 0;

      this.raiModel = String(r);
      this.nganModel = String(n);
      this.wahModel = (this.fmt2 ? this.fmt2(w) : w.toFixed(2));

      this.onRNWInput(); // อัปเดต size ตามค่าที่ normalize แล้ว
    },

    sanitizeDecimal(s) {
      // อนุญาตเฉพาะตัวเลขกับจุดทศนิยม 1 จุด (พิมพ์ .2, 0. หรือ 12.34 ได้)
      if (s == null) return "";
      let str = String(s).replace(/,/g, '').replace(/[^\d.]/g, '');
      const firstDot = str.indexOf('.');
      if (firstDot !== -1) {
        str = str.slice(0, firstDot + 1) + str.slice(firstDot + 1).replace(/\./g, '');
      }
      return str;
    },

    unformatDecimal(v) {
      if (v == null || v === '') return null;
      const n = parseFloat(String(v).replace(/,/g, ''));
      return Number.isFinite(n) ? n : null;
    },

    formatLandSize(value) {
      if (value == null || value === '') return '';
      let str = String(value).replace(/,/g, '').trim();

      // ถ้าเริ่มด้วยจุด เช่น ".2" → เติม 0 หน้า → "0.2"
      if (str.startsWith('.')) str = '0' + str;

      // ถ้าใส่เฉพาะ "." หรือ "0." → คืนเป็นค่าว่าง
      if (str === '.' || str === '0.') return '';

      const num = parseFloat(str);
      if (!Number.isFinite(num)) return '';

      // ถ้าจบด้วยจุด หรือเป็นรูปแบบ ".0" หรือ ".00" → ตัดทศนิยมทิ้ง
      if (str.endsWith('.') || /\.0+$/.test(str)) {
        return num.toLocaleString(); // แสดงเป็นจำนวนเต็ม
      }

      // ถ้าเป็นรูปแบบ ".2" หรือ "19.2" → เติม 0 ให้ครบ 2 หลัก
      if (/^\d+\.\d$/.test(str) || /^0\.\d$/.test(str)) {
        return num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }

      // ถ้าเป็นจำนวนเต็ม → แสดงแบบไม่มีทศนิยม
      if (Number.isInteger(num)) return num.toLocaleString();

      // ถ้าเป็นทศนิยม (เช่น 19.25) → แสดง 2 หลัก
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    async saveLandData() {
      if (!(this.landData.owner?.trim() || this.landData.agent?.trim())) {
        alert("กรุณากรอกชื่อเจ้าของ หรือ ชื่อนายหน้า อย่างใดอย่างหนึ่ง");
        return;
      }
      const inputHasRNW =
        (this.raiModel != null && String(this.raiModel).trim() !== '') ||
        (this.nganModel != null && String(this.nganModel).trim() !== '') ||
        (this.wahModel != null && String(this.wahModel).trim() !== '');

      let sizeSqw = this.unformatDecimal(this.landData.size);
      if (inputHasRNW) {
        sizeSqw = this.sizeFromRaiNganWah(this.raiModel, this.nganModel, this.wahModel);
      }


      const geometry = this.drawPoints.length >= 3
        ? { type: "Polygon", coordinates: this.drawPoints.map(p => [p.lon, p.lat]) }
        : null;

      const markerLoc = geometry
        ? { lon: this.drawPoints[0].lon, lat: this.drawPoints[0].lat }
        : { lon: this.currentLocation.lon, lat: this.currentLocation.lat };

      const payload = {
        size: sizeSqw,
        frontage: this.unformatDecimal(this.landData.width),
        roadWidth: this.unformatDecimal(this.landData.road),
        pricePerSqw: this.unformatDecimal(this.landData.price),
        totalPrice: this.unformatDecimal(this.landData.totalPrice),
        landFrame: (this.landData.landFrame || "").trim(),
        deedInformation: (this.landData.deedInformation || "").trim(),
        owner: (this.landData.owner || "").trim(),
        agent: (this.landData.agent || "").trim(),
        phone: (this.landData.phone || "").trim(),
        lineId: (this.landData.lineId || "").trim(),
        location: markerLoc,
        geometry,

        id: this.editingLandId || undefined,
      };

      try {
        if (!this.currentUserId) { alert("ยังไม่ได้เข้าสู่ระบบ (เปิด anonymous ได้)"); return; }


        await saveLand(this.currentUserId, payload);
        this.landData = {
          size: "",
          width: "",
          owner: "",
          agent: "",
          phone: "",
          lineId: "",
          price: "",
          totalPrice: "",
          road: "",
          landFrame: "",
          deedInformation: "",
        };
        this.editingLandId = null;
        this.clearDrawing();
        alert("บันทึกเรียบร้อย");
      } catch (e) {
        console.error("saveLand failed:", e);
        alert("บันทึกไม่สำเร็จ: " + (e?.message || e));
      }
    },
    },

    
    watch: {
    availableLayers: {
      handler(newVal) {
        const markersLayer = newVal.find((l) => l.id === 1);
        if (markersLayer) {
          this.toggleMarkersLayer();
        }
        console.log("Start pop-up");
      },
      deep: true,
    },

    'landData.size'() { this.syncFromSize(); if (this.landData.price) this.syncPriceFromPerSqw(); },
    raiModel() { this.onRNWInput(); },
    nganModel() { this.onRNWInput(); },
    wahModel() { this.onRNWInput(); },

    'landData.owner'(val) {
      if (val && val.trim() !== '') this.landData.agent = '';
    },
    'landData.agent'(val) {
      if (val && val.trim() !== '') this.landData.owner = '';
    },
    }
}
</script> -->

<script src="../../app-script2.js"></script>
<style>@import "../../styles/app.css";</style>

<template>
  <!-- Form Section -->
  <div class="form-section">
    <h3 @click="isFormOpen = !isFormOpen" style="cursor: pointer">
      ข้อมูลแปลง (พื้นดิน)
      <span v-if="isFormOpen">▲</span>
      <span v-else>▼</span>
    </h3>

    <transition name="fade">
      <div v-show="isFormOpen">
        <div class="form-subtitle">ข้อมูลการประเมินแปลง</div>
        <div class="form-subtitle">ระบบสามารถให้ข้อมูลอัตโนมัติ</div>
        <div
          class="form-row"
          style="display: flex; gap: 10px; flex-wrap: nowrap"
        >
          <!-- ฝั่งซ้าย: ขนาดที่ดิน (ตร.วา) -->
          <div style="flex: 1; max-width: 50%">
            <label class="form-group">ขนาดที่ดิน (ตร.วา)</label>
            <input
              type="text"
              inputmode="decimal"
              v-model="landData.size"
              @input="
                landData.size = sanitizeDecimal($event.target.value);
                syncFromSize();
                if (landData.price) syncPriceFromPerSqw();
              "
              @blur="
                landData.size = formatLandSize(landData.size);
                syncFromSize();
              "
              class="form-input text-center"
              placeholder="0"
            />
          </div>

          <!-- ฝั่งขวา: ขนาดที่ดิน (ไร่ / งาน / วา) -->
          <div style="flex: 1; max-width: 50%">
            <label class="form-group">ขนาดที่ดิน (ไร่/งาน/วา)</label>
            <div style="display: flex; gap: 5px">
              <input
                class="form-input text-center"
                style="width: 33.33%"
                inputmode="numeric"
                v-model="raiModel"
                @input="onRNWInput()"
                @blur="normalizeRNW()"
                placeholder="0"
              />
              <input
                class="form-input text-center"
                style="width: 33.33%"
                inputmode="numeric"
                v-model="nganModel"
                @input="onRNWInput()"
                @blur="normalizeRNW()"
                placeholder="0"
              />
              <input
                class="form-input text-center"
                style="width: 33.33%"
                inputmode="decimal"
                v-model="wahModel"
                @input="
                  wahModel = sanitizeDecimal($event.target.value);
                  onRNWInput();
                "
                @blur="
                  wahModel = formatLandSize(wahModel);
                  normalizeRNW();
                "
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div></div>

        <div class="form-group" style="display: flex; gap: 10px">
          <div class="form-group">
            <label class="form-group">หน้ากว้างติดถนน (M)</label>
            <input
              type="text"
              inputmode="numeric"
              :value="formatNumber(landData.width)"
              @input="
                landData.width = unformatNumber($event.target.value)
              "
              class="form-input"
              placeholder="0"
            />
          </div>

          <div class="form-group">
            <label class="form-group">ขนาดถนน (M)</label>
            <input
              type="text"
              inputmode="numeric"
              :value="formatNumber(landData.road)"
              @input="landData.road = unformatNumber($event.target.value)"
              class="form-input"
              placeholder="0"
            />
          </div>
        </div>

        <div class="form-group" style="display: flex; gap: 10px">
          <!-- ราคาต่อตารางวา -->
          <div>
            <label class="form-group">ราคาต่อตารางวา</label>
            <input
              type="text"
              inputmode="decimal"
              v-model="landData.price"
              @input="
                landData.price = sanitizeDecimal(landData.price);
                syncPriceFromPerSqw();
              "
              @blur="landData.price = formatPrice(landData.price)"
              class="form-input text-center"
              placeholder="0"
            />
          </div>

          <!-- ราคารวม -->
          <div>
            <label class="form-group">ราคารวม</label>
            <input
              type="text"
              inputmode="decimal"
              v-model="landData.totalPrice"
              @input="
                landData.totalPrice = sanitizeDecimal(
                  landData.totalPrice
                );
                syncPerSqwFromTotal();
              "
              @blur="
                landData.totalPrice = formatPrice(landData.totalPrice)
              "
              class="form-input text-center"
              placeholder="0"
            />
          </div>
        </div>
        <div class="form-group">
          <label class="form-group">เจ้าของ</label>
          <input
            type="text"
            v-model="landData.owner"
            placeholder="ชื่อเจ้าของ"
            class="form-input"
            :disabled="!!(landData.agent && landData.agent.trim())"
          />
        </div>
        <div class="form-group">
          <label class="form-group">นายหน้า</label>
          <input
            type="text"
            v-model="landData.agent"
            placeholder="ชื่อนายหน้า"
            class="form-input"
            :disabled="!!(landData.owner && landData.owner.trim())"
          />
        </div>
        <div class="form-group" style="display: flex; gap: 10px">
          <div class="form-group">
            <label class="form-group">โทร</label>
            <input
              type="text"
              v-model="landData.phone"
              placeholder="08x-xxx-xxxx"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-group">LINE ID</label>
            <input
              type="text"
              v-model="landData.lineId"
              placeholder="@lineid หรือ lineid"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-group">กรอบที่ดิน</label>
          <input
            type="text"
            v-model="landData.landFrame"
            placeholder="กรอบที่ดิน"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-group">ข้อมูลโฉนด/ระวาง</label>
          <input
            type="text"
            v-model="landData.deedInformation"
            placeholder="ข้อมูลโฉนด/ระวาง"
            class="form-input"
          />
        </div>

        <button
          style="margin-top: 30px"
          class="btn btn-primary btn-full"
          @click="saveLandData"
        >
          บันทึกและปิด
        </button>
      </div>
    </transition>
  </div>
</template>