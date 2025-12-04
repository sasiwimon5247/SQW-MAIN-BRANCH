export default {
    methods: {

    // ...existing code...

    // ใช้ตอนคลิก “รายการฝั่งซ้าย”
    focusLand(land, zoom = 17) {
      if (!land || !this.map) return;
      // ใส่ข้อมูลลงแบบฟอร์ม/ฝั่งขวา เหมือนตอนคลิกที่ polygon/หมุด
      this.selectLand(land);

      // หา center แล้วเลื่อนไป
      const c = this.getLandCenter(land);
      this.centerTo(c.lon, c.lat, zoom);
    },
    
    onLandOverlayClick(land) {
      this.selectLand(land);
    },

    // --- Select a land and populate the form for editing
    selectLand(land) {
      if (!land) return;
      this.editingLandId = land.id || null;

      // Map model -> form model
      this.landData = {
        size: land.size ?? land.area ?? "",
        width: land.frontage ?? land.width ?? "",
        road: land.roadWidth ?? land.road ?? "",
        price: land.pricePerSqw != null ? this.formatMoney(land.pricePerSqw) : "",
        totalPrice: land.totalPrice ?? "",
        landFrame: land.landFrame ?? "",
        deedInformation: land.deedInformation ?? "",
        owner: land.owner ?? "",
        agent: land.agent ?? "",
        phone: land.phone ?? "",
        lineId: land.lineId ?? "",
      };

      // แตก size (ตร.วา) เป็น RNW ให้ช่องด้านขวา
      const { rai, ngan, wah } = this.rnwFromSize(this.landData.size);
      this.raiModel = (rai === "" ? "" : String(rai));
      this.nganModel = (ngan === "" ? "" : String(ngan));
      this.wahModel = (wah === "" ? "" : (this.fmt2 ? this.fmt2(wah) : wah.toFixed(2)));


      // Map model -> form model
      this.landData = {
        size: land.size ?? land.area ?? "",
        width: land.frontage ?? land.width ?? "",
        road: land.roadWidth ?? land.road ?? "",
        price: land.pricePerSqw != null ? this.formatMoney(land.pricePerSqw) : "",
        totalPrice: land.totalPrice ?? "",
        landFrame: land.landFrame ?? "",
        deedInformation: land.deedInformation ?? "",
        owner: land.owner ?? "",
        agent: land.agent ?? "",
        phone: land.phone ?? "",
        lineId: land.lineId ?? "",
      };

      // Draw selected geometry for visual
      try {
        if (land.geometry?.type === "Polygon" && Array.isArray(land.geometry.coordinates)) {
          const pts = land.geometry.coordinates.map(([lon, lat]) => ({ lon, lat }));
          this.clearDrawing();
          this.drawPoints = pts;
          if (this.drawPoints.length >= 3) {
            try { if (this.drawPolyline) this.map.Overlays.remove(this.drawPolyline); } catch (e) { }
            try { if (this.drawPolygon) this.map.Overlays.remove(this.drawPolygon); } catch (e) { }
            this.drawPolygon = new window.longdo.Polygon(this.drawPoints, {
              lineWidth: 2, lineColor: "rgba(30,144,255,0.9)", fillColor: "rgba(30,144,255,0.25)",
            });
            this.map.Overlays.add(this.drawPolygon);
          }
        }
      } catch (e) { console.debug("selectLand draw error", e); }
    },


    async deleteLandItem(landId) {
        if (!landId || !this.currentUserId) return;
        if (!confirm("ยืนยันลบแปลงนี้?")) return;
        try {
        await deleteLand(this.currentUserId, landId);
        // savedLands จะอัปเดตเองจาก subscribeLands → renderLandsOnMap() จะถูกเรียกอัตโนมัติ
        } catch (e) {
        console.error("deleteLand failed:", e);
        alert("ลบไม่สำเร็จ");
        }
    },

    }
}