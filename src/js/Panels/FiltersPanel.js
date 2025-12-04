export default {
    methods: {

    applyFilters() {
      console.log(this.filters);
      this.showFilters = false;
      const {
        roadWidth, areaMin, areaMax, areaMinRai, areaMaxRai, priceMin, totalPriceMin, totalPriceMax, priceMax, frontMin, frontMax,
      } = this.filters;

      // แปลงค่าว่าง -> null / ตัวเลข
      const parseNum = (v) =>
        (v === "" || v == null ? null : Number(String(v).replace(/,/g, "")));

      // map ค่า roadWidth จาก dropdown -> ช่วงตัวเลข
      const roadMinMax = (rw) => {
        if (!rw) return [null, null];
        if (rw === "lt6") return [null, 6];
        if (rw === "6-9.99") return [6, 9.99];
        if (rw === "ge10") return [10, null];
        if (rw === "ge18") return [18, null];
        if (rw === "ge30") return [30, null];
        return [null, null];
      };

      const toSqw = (sqw, rai) => {
        const s = parseNum(sqw);
        const r = parseNum(rai);
        return (s == null && r == null) ? null : (s || 0) + (r || 0) * 400;
      };

      const [rwMin, rwMax] = roadMinMax(roadWidth);
      const aMin = toSqw(areaMin, areaMinRai);
      const aMax = toSqw(areaMax, areaMaxRai);
      const pMin = parseNum(priceMin),
        pMax = parseNum(priceMax);
      const tpMin = parseNum(totalPriceMin),
        tpMax = parseNum(totalPriceMax);
      const fMin = parseNum(frontMin),
        fMax = parseNum(frontMax);

      const getArea = (it) =>
        it.area != null ? +it.area : it.size ? +it.size : 0;
      const getPriceSqw = (it) =>
        it.pricePerSqw != null ? +it.pricePerSqw : it.price ? +it.price : 0;
      const getTotalPrice = (it) => it.totalPrice ?? (getArea(it) * getPriceSqw(it));
      const getFrontage = (it) =>
        it.frontage != null ? +it.frontage : it.width ? +it.width : 0;
      const getRoadWidth = (it) =>
        it.roadWidth != null ? +it.roadWidth : it.road ? +it.road : null;

      if (Array.isArray(this.savedLands)) {
        this.filteredLands = this.savedLands.filter((item) => {
          const area = getArea(item);
          const priceSqw = getPriceSqw(item);
          const total = +getTotalPrice(item);
          const frontage = getFrontage(item);
          const rwidth = getRoadWidth(item);

          const inArea =
            (aMin == null || area >= aMin) && (aMax == null || area <= aMax);
          const inPrice =
            (pMin == null || priceSqw >= pMin) &&
            (pMax == null || priceSqw <= pMax);
          const inTotal = (tpMin == null || total >= tpMin) && (tpMax == null || total <= tpMax);

          const inFront =
            (fMin == null || frontage >= fMin) &&
            (fMax == null || frontage <= fMax);
          const inRoad =
            (rwMin == null || (rwidth != null && rwidth >= rwMin)) &&
            (rwMax == null || (rwidth != null && rwidth <= rwMax));

          return inArea && inPrice && inTotal && inFront && inRoad;
        });
      } else {
        this.filteredLands = [];
      }

      this.addMarkersToMap(); // รีเรนเดอร์หมุดตามเงื่อนไขใหม่
      this.renderLandsOnMap();
      this.applyKmlFiltersUsingUI();
    },

    applyKmlFiltersUsingUI() {
      if (!this.map || !Array.isArray(this.kmlFeatures) || !this.kmlFeatures.length) return;

      // อ่านค่าตัวกรองแบบเดียวกับใน applyFilters()
      const toNum = (v) => (v === "" || v == null ? null : Number(String(v).replace(/,/g, "")));

      const toSqw = (sqw, rai) => {
        const s = toNum(sqw);
        const r = toNum(rai);
        return (s == null && r == null) ? null : (s || 0) + (r || 0) * 400;
      };
      const aMin = toSqw(this.filters.areaMin, this.filters.areaMinRai);
      const aMax = toSqw(this.filters.areaMax, this.filters.areaMaxRai);
      const pMin = toNum(this.filters.priceMin);
      const pMax = toNum(this.filters.priceMax);
      const tpMin = toNum(this.filters.totalPriceMin);
      const tpMax = toNum(this.filters.totalPriceMax);
      const fMin = toNum(this.filters.frontMin);
      const fMax = toNum(this.filters.frontMax);

      const roadSel = (this.filters.roadWidth || this.filters.landType || "").trim();
      const roadRange = (sel) => {
        switch (sel) {
          case "lt6": return [null, 6];
          case "6-9.99": return [6, 9.99];
          case "10-11.99": return [10, 11.99];
          case "12-17.99": return [12, 17.99];
          case "18-29.99": return [18, 29.99];
          case "ge30": return [30, null];
          default: return [null, null];
        }
      };
      const [rwMin, rwMax] = roadRange(roadSel);

      // ช่วยเช็คช่วง
      const inRange = (val, min, max) =>
        (min == null || (val != null && val >= min)) &&
        (max == null || (val != null && val <= max));

      // loop ทุก overlay ที่มาจาก KML
      this.kmlFeatures.forEach(({ overlay, props }) => {
        const total =
          props?.totalPrice != null
            ? Number(props.totalPrice)
            : (props?.area != null && props?.pricePerSqw != null
              ? Number(props.area) * Number(props.pricePerSqw)
              : null);
        const ok =
          inRange(props?.area, aMin, aMax) &&
          inRange(props?.pricePerSqw, pMin, pMax) &&
          inRange(total, tpMin, tpMax) &&
          inRange(props?.frontage, fMin, fMax) &&
          inRange(props?.roadWidth, rwMin, rwMax);

        // toggle แสดง/ซ่อน โดยไม่ทิ้งออบเจ็กต์
        try {
          if (ok) {
            // ถ้าเคยถูกลบออก ให้ add กลับ
            if (!overlay._onMap) {
              this.map.Overlays.add(overlay);
              overlay._onMap = true;
            }
          } else {
            console.log("Removing", overlay.__kml?.props?.name, overlay);
            this.map.Overlays.remove(overlay);
            overlay._onMap = false;
          }
        } catch (e) {
          // เงียบไว้
        }
      });
    },

    resetFilters() {
      this.filters = {
        landType: "", priceMin: "", priceMax: "",
        areaMin: "", areaMax: "", totalPriceMin: "", totalPriceMax: "", roadWidth: "",
        frontMin: "", frontMax: "",
      };
      this.filteredLands = [];
      this.addMarkersToMap();
      this.renderLandsOnMap();
    },

    }
}