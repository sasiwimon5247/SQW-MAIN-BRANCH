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

<script src="./app-script2.js"></script>
<style>@import "./styles/app.css";</style>