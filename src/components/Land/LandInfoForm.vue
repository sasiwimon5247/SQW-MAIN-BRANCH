<style>@import "../../styles/app.css";</style>
<script>
/* eslint-disable */
export default {
  name: "LandInfoForm",

  props: {
    // รับ landData จาก App (object เดียวกับที่ใช้ใน app-script2.js)
    landData: {
      type: Object,
      required: true,
    },
  },

  emits: ["save"],

  data() {
    return {
      isFormOpen: true,
      raiModel: "",
      nganModel: "",
      wahModel: "",
    };
  },

  mounted() {
    // ถ้ามีค่าขนาดที่ดินอยู่แล้ว แปลงเป็นไร่/งาน/วา เริ่มต้น
    if (this.landData.size) {
      this.syncFromSize();
    }
  },

  methods: {
    // แสดงตัวเลขพร้อมคอมมา
    formatNumber(value) {
      if (value == null || value === "") return "";
      return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // แปลงตัวเลขมีคอมมา -> ตัวเลขดิบ
    unformatNumber(value) {
      if (!value) return "";
      return parseInt(String(value).replace(/,/g, ""), 10) || 0;
    },

    // ล้างอินพุตให้เหลือเฉพาะตัวเลข + จุดทศนิยม 1 จุด
    sanitizeDecimal(s) {
      if (s == null) return "";
      let str = String(s).replace(/,/g, "").replace(/[^\d.]/g, "");
      const firstDot = str.indexOf(".");
      if (firstDot !== -1) {
        str =
          str.slice(0, firstDot + 1) +
          str.slice(firstDot + 1).replace(/\./g, "");
      }
      return str;
    },

    // แปลงสตริงเป็นเลขทศนิยม (รองรับคอมมา)
    unformatDecimal(v) {
      if (v == null || v === "") return null;
      const n = parseFloat(String(v).replace(/,/g, ""));
      return Number.isFinite(n) ? n : null;
    },

    // จัดรูปแบบขนาดที่ดิน (ให้เลขสวย ๆ)
    formatLandSize(value) {
      if (value == null || value === "") return "";
      let str = String(value).replace(/,/g, "").trim();

      if (str.startsWith(".")) str = "0" + str;
      if (str === "." || str === "0.") return "";

      const num = parseFloat(str);
      if (!Number.isFinite(num)) return "";

      if (str.endsWith(".") || /\.0+$/.test(str)) {
        return num.toLocaleString(); // แสดงเป็นจำนวนเต็ม
      }

      if (/^\d+\.\d$/.test(str) || /^0\.\d$/.test(str)) {
        return num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }

      return num.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
    },

    // แปลงไร่/งาน/วา -> ตารางวา
    sizeFromRaiNganWah(rai, ngan, wah) {
      const R = parseInt(String(rai ?? "").replace(/,/g, ""), 10);
      const N = parseInt(String(ngan ?? "").replace(/,/g, ""), 10);
      const W = parseFloat(String(wah ?? "").replace(/,/g, "")) || 0;
      const r = Number.isFinite(R) ? R : 0;
      const n = Number.isFinite(N) ? N : 0;
      const w = Number.isFinite(W) ? W : 0;
      return +(r * 400 + n * 100 + w).toFixed(2);
    },

    // แปลงตารางวา -> ไร่/งาน/วา
    rnwFromSize(sizeSqw) {
      const s = parseFloat(String(sizeSqw ?? "").replace(/,/g, ""));
      if (!Number.isFinite(s) || s < 0) {
        return { rai: "", ngan: "", wah: "" };
      }
      const rai = Math.floor(s / 400);
      const rem1 = s - rai * 400;
      const ngan = Math.floor(rem1 / 100);
      const wah = +(rem1 - ngan * 100).toFixed(2);
      return { rai, ngan, wah };
    },

    // sync จาก landData.size -> RNW
    syncFromSize() {
      const { rai, ngan, wah } = this.rnwFromSize(this.landData.size);
      this.raiModel = rai === "" ? "" : String(rai);
      this.nganModel = ngan === "" ? "" : String(ngan);
      this.wahModel =
        wah === "" ? "" : wah.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    },

    // เมื่อเปลี่ยนค่าไร่/งาน/วา -> คำนวณ size ใหม่
    onRNWInput() {
      const sqw = this.sizeFromRaiNganWah(
        this.raiModel,
        this.nganModel,
        this.wahModel
      );
      this.landData.size = Number.isInteger(sqw)
        ? sqw.toLocaleString()
        : sqw.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
    },

    // normalize RNW: งาน 0–3, วา 0–99.99 แล้วทอนหน่วย
    normalizeRNW() {
      let r = parseInt(this.raiModel || 0, 10);
      r = Number.isFinite(r) ? r : 0;
      let n = parseInt(this.nganModel || 0, 10);
      n = Number.isFinite(n) ? n : 0;
      let w = parseFloat(this.wahModel || 0);
      w = Number.isFinite(w) ? w : 0;

      if (w >= 100) {
        n += Math.floor(w / 100);
        w = w % 100;
      }
      if (n >= 4) {
        r += Math.floor(n / 4);
        n = n % 4;
      }

      if (w < 0) w = 0;
      if (n < 0) n = 0;
      if (r < 0) r = 0;

      this.raiModel = String(r);
      this.nganModel = String(n);
      this.wahModel = w.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      this.onRNWInput();
    },

    // sync ราคาจาก "ราคาต่อตารางวา" -> "ราคารวม"
    syncPriceFromPerSqw() {
      const pricePerSqw =
        this.unformatDecimal(this.landData.price) ?? 0;
      const sizeSqw = this.unformatDecimal(this.landData.size) ?? 0;

      if (sizeSqw > 0 && pricePerSqw >= 0) {
        const total = pricePerSqw * sizeSqw;
        this.landData.totalPrice = total.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      } else {
        this.landData.totalPrice = "";
      }
    },

    // sync ราคาจาก "ราคารวม" -> "ราคาต่อตารางวา"
    syncPerSqwFromTotal() {
      const totalPrice =
        this.unformatDecimal(this.landData.totalPrice) ?? 0;
      const sizeSqw = this.unformatDecimal(this.landData.size) ?? 0;

      if (sizeSqw > 0 && totalPrice >= 0) {
        const perSqw = totalPrice / sizeSqw;
        this.landData.price = perSqw.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      } else {
        this.landData.price = "";
      }
    },

    // ฟอร์แมตราคาให้มีคอมมา
    formatPrice(v) {
      if (v == null || v === "") return "";
      const n = this.unformatDecimal(v);
      if (n == null) return "";
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    },

    // กดปุ่มบันทึก → ให้ App จัดการ save จริง
    saveLandData() {
      this.$emit("save");
    },
  },
};
</script>

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
              @input="landData.width = unformatNumber($event.target.value)"
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
                landData.totalPrice = sanitizeDecimal(landData.totalPrice);
                syncPerSqwFromTotal();
              "
              @blur="landData.totalPrice = formatPrice(landData.totalPrice)"
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
