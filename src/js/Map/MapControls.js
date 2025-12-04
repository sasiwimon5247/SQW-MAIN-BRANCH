export default {
    methods: {

    initDolWms_Longdo() {
      try {
        this.map?.Event?.bind?.("ready", () => {
          const lyr = new window.longdo.Layer("dol", {
            type: window.longdo.LayerType.WMS,
            url: "https://ms.longdo.com/mapproxy/service",
            format: "image/png",
            srs: "EPSG:3857",
            opacity: this.opacity ?? 0.85,
          });

          console.log(
            "[DOL WMS] constructed is longdo.Layer?",
            lyr instanceof window.longdo.Layer,
            lyr
          );

          this.wmsDol = lyr;
          if (this.dolEnabled) this.map.Layers.add(this.wmsDol);
        });
      } catch (e) {
        console.debug("initDolWms_Longdo error:", e);
      }
    },

    onChangeBaseMap(type) {
      if (!this.map || !window.longdo?.Layers) return;
      const key = (type || "").toUpperCase();
      const resolve = (v) => (typeof v === "function" ? v() : v);

      const B = window.longdo.Layers;
      const dict = {
        NORMAL: B.NORMAL,
        HYBRID: B.HYBRID,
        SATELLITE: B.SATELLITE,
        GRAY: B.GRAY,
      };
      const target = resolve(dict[key] || B.HYBRID);

      console.log(
        "setBase =>",
        key,
        "type=",
        typeof dict[key],
        "target=",
        target
      );
      try {
        if (this.map.Layers?.setBase) this.map.Layers.setBase(target);
        else if (this.map.Layers?.base) this.map.Layers.base(target);
      } catch (e) {
        console.error("setBase error:", e, "key=", key, "target=", target);
      }
    },

    applyDolVisibility() {
      try {
        if (!this.map?.Layers?.add || !this.wmsDol) return;

        this.wmsDol.opacity = this.opacity ?? 0.85;

        if (this.dolEnabled) {
          this.map.Layers.remove(this.wmsDol);
          this.map.Layers.add(this.wmsDol);
        } else {
          this.map.Layers.remove(this.wmsDol);
        }
      } catch (e) {
        console.debug("applyDolVisibility error:", e);
      }
    },

    onToggleDol() {
      this.applyDolVisibility();
    },

    onChangeDolOpacity() {
      this.applyDolVisibility();
    },

    toggleSearch() {
      this.showSearch = !this.showSearch;
      this.showFilters = false;
      this.showLayers = false;
      this.showChat = false;
    },

    toggleFilters() {
      this.showFilters = !this.showFilters;
      this.showSearch = false;
      this.showLayers = false;
      this.showChat = false;
    },

    toggleLayers() {
      this.showLayers = !this.showLayers;
      this.showSearch = false;
      this.showFilters = false;
      this.showChat = false;
    },

    viewMyProperty() {
      console.log("View my property");
      // Show only user's markers
      this.showSearch = false;
      this.showFilters = false;
      this.showLayers = true;
    },

    exploreArea() {
      console.log("Explore area");
    },

    // ===== Flood Zone helpers =====
    startFloodDrawing(level = 'medium') {
      this.floodMode = true;
      this.floodLevel = level;
      this.floodPoints = [];
      this.redrawFloodDrawing();
      try { document.getElementById('map').style.cursor = 'crosshair'; } catch (e) { }
    },

    async finishFloodDrawing() {
      if (!this.map) return;
      if (this.floodPoints.length < 3) { alert("ต้องคลิกอย่างน้อย 3 จุด"); return; }

      // ลบชั่วคราว
      try { if (this.floodPolyline) this.map.Overlays.remove(this.floodPolyline); } catch (e) { }
      try { if (this.floodPolygon) this.map.Overlays.remove(this.floodPolygon); } catch (e) { }

      // เตรียม payload
      const geometry = { type: "Polygon", coordinates: this.floodPoints.map(p => [p.lon, p.lat]) };
      const center = this.floodPoints[0] || this.currentLocation; // optional

      if (!this.currentUserId) { alert("ยังไม่ได้เข้าสู่ระบบ"); return; }

      try {
        await saveFloodZone(this.currentUserId, {
          level: this.floodLevel,
          waterAmount: this.waterAmount,
          geometry,
          location: center,
        });

        // ปล่อยให้ subscribeFloodZonesAll → renderFloodsOnMap() เป็นคนวาด (จะไม่ซ้ำ)
      } catch (e) {
        console.error("saveFloodZone failed:", e);
        alert("บันทึกน้ำท่วมไม่สำเร็จ");
      }

      // reset state การวาด
      this.floodMode = false;
      this.floodPoints = [];
      this.floodPolyline = null;
      this.floodPolygon = null;
      try { document.getElementById('map').style.cursor = 'default'; } catch (e) { }
    },


    clearFloodDrawing() {
      this.floodMode = false;
      this.floodPoints = [];
      try { if (this.floodPolyline) this.map.Overlays.remove(this.floodPolyline); } catch (e) { }
      try { if (this.floodPolygon) this.map.Overlays.remove(this.floodPolygon); } catch (e) { }
      this.floodPolyline = null;
      this.floodPolygon = null;
      try { document.getElementById('map').style.cursor = 'default'; } catch (e) { }
    },

    toggleFloodLayer() {
      this.showFloodLayer = !this.showFloodLayer;
      if (!this.map) return;

      // ถ้าปิดเลเยอร์ ให้ล้างการเลือกด้วย
      if (!this.showFloodLayer) this.clearFloodSelection();

      this.floodOverlays.forEach(ov => {
        try {
          if (this.showFloodLayer && !ov._onMap) {
            this.map.Overlays.add(ov);
            ov._onMap = true;
          } else if (!this.showFloodLayer && ov._onMap) {
            this.map.Overlays.remove(ov);
            ov._onMap = false;
          }
        } catch (e) { }
      });
    },

    increaseWaterAmount() {
      if (this.waterAmount < 5) {
        this.waterAmount++;
        this.restyleAllFloodPolygons();
      }
    },
    decreaseWaterAmount() {
      if (this.waterAmount > 1) {
        this.waterAmount--;
        this.restyleAllFloodPolygons();
      }
    },

    async deleteSelectedFlood() {
      if (!this.map || !this.selectedFlood) return;

      const id = this.selectedFlood.__flood?.id;
      const ownerUid = this.selectedFlood.__flood?.ownerUid || this.currentUserId;

      if (!confirm("ยืนยันลบโซนน้ำท่วมนี้?")) return;

      try {
        if (id) {
          await deleteFloodZone(ownerUid, id);
          // หลังลบ สำเนาในหน้าจอจะถูก sync ออกโดย subscribe → renderFloodsOnMap()
        } else {
          // กรณียังไม่ถูกบันทึก (ไม่มี id) → ลบเฉพาะบนแผนที่
          if (this.selectedFlood._onMap) this.map.Overlays.remove(this.selectedFlood);
          this.floodOverlays = this.floodOverlays.filter(ov => ov !== this.selectedFlood);
        }
      } catch (e) {
        console.error("deleteFloodZone failed:", e);
        alert("ลบไม่สำเร็จ");
      }

      this.clearFloodSelection();
    },

    }
}