export default {
    methods: {

    makeGroundKmlString({
      west = 100.20,
      south = 13.40,
      east = 101.05,
      north = 14.10,
      opacity = 0.7
    } = {}) {
      const aa = Math.round(opacity * 255).toString(16).padStart(2, '0');
      const color = `${aa}ffffff`;
      return `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
          <GroundOverlay>
            <Icon><href>/img/bangkok_56.png</href></Icon>
            <LatLonBox>
              <north>${north}</north>
              <south>${south}</south>
              <east>${east}</east>
              <west>${west}</west>
            </LatLonBox>
            <color>${color}</color>
          </GroundOverlay>
        </Document>
      </kml>`;
    },

    addBangkokOverlayDaft() {
      if (!this.map) return;

      if (this.bkkRect) {
        try { this.map.Overlays.remove(this.bkkRect); } catch (e) { }
        this.bkkRect = null;
      }

      // กรอบที่คลุม กทม. (เริ่มด้วยค่ากว้าง ๆ แล้วค่อยจูน)
      const west = 100.325, north = 13.9548, east = 100.9412, south = 13.484;

      // มุมซ้ายบน-ขวาล่าง
      const tl = { lon: west, lat: north };
      const br = { lon: east, lat: south };

      this.bkkRect = new window.longdo.Rectangle(
        tl, br,
        {
          texture: '/img/bangkok_draft.png',     // รูปต้องอยู่โดเมนเดียวกัน
          textureAlpha: this.kmlOpacity,      // ความโปร่งใส 0–1
          lineWidth: 0,
          weight: window.longdo.OverlayWeight.Top
        }
      );

      this.map.Overlays.add(this.bkkRect);
      /* try {
        this.map.bound([tl, br]);                // รูปแบบถูกต้อง
      } catch (e) {
        const center = { lon: (west + east) / 2, lat: (south + north) / 2 };
        this.map.location(center, true);
        this.map.zoom(11, true);
      }// โชว์เต็มรูป */
    },

    addBangkokOverlay() {
      if (!this.map) return;

      if (this.bkkRect) {
        try { this.map.Overlays.remove(this.bkkRect); } catch (e) { }
        this.bkkRect = null;
      }

      // กรอบที่คลุม กทม. (เริ่มด้วยค่ากว้าง ๆ แล้วค่อยจูน)
      const west = 100.327, north = 13.956, east = 100.9402, south = 13.4843;

      // มุมซ้ายบน-ขวาล่าง
      const tl = { lon: west, lat: north };
      const br = { lon: east, lat: south };

      this.bkkRect = new window.longdo.Rectangle(
        tl, br,
        {
          texture: '/img/bangkok_56.png',     // รูปต้องอยู่โดเมนเดียวกัน
          textureAlpha: this.kmlOpacity,      // ความโปร่งใส 0–1
          lineWidth: 0,
          weight: window.longdo.OverlayWeight.Top
        }
      );

      this.map.Overlays.add(this.bkkRect);
      /* try {
        this.map.bound([tl, br]);                // รูปแบบถูกต้อง
      } catch (e) {
        const center = { lon: (west + east) / 2, lat: (south + north) / 2 };
        this.map.location(center, true);
        this.map.zoom(11, true);
      }// โชว์เต็มรูป */
    },

    setBangkokOverlayOpacity(val) {
      this.kmlOpacity = +val;
      this.addBangkokOverlay();   // สร้างใหม่เพื่ออัปเดต alpha
    },

    clearBangkokOverlay() {
      if (!this.map || !this.bkkRect) return;
      this.map.Overlays.remove(this.bkkRect);
      this.bkkRect = null;
    },


    loadBangkokOverlay() {
      if (!this.map) return;
      // ล้างของเดิมก่อน
      this.clearKml();
      // สร้าง KML ตาม opacity ปัจจุบัน
      const kml = this.makeGroundKmlString({ opacity: this.kmlOpacity });
      const result = window.kmlToLongdoMap(this.map, kml, {
        // ไม่ต้องเซ็ต geometryOptions/markerOptions เพราะเป็น GroundOverlay
      });
      this.kmlState = result;
      this.kmlOverlays = (result && result.overlays) || [];
      if (result?.bound) this.map.bound(result.bound);
    },

    makeMarkerDetailHtml(item = {}) {
      try {
        const esc = (v) =>
          v == null
            ? ""
            : String(v)
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");

        // --- masking helpers ---
        const maskName = (name) => {
          if (!name) return "";
          const s = String(name).trim();
          // แยกเป็นคำ (ชื่อ / นามสกุล)
          const parts = s.split(/\s+/);
          const masked = parts.map((p, idx) => {
            const len = p.length;
            if (len === 1) return p; // ไม่แก้ไข
            if (idx === 0) {
              // ชื่อ: เก็บตัวแรก + xxx (หรือจำนวน x ตามขนาด ถ้าสั้น)
              const keep = p.charAt(0);
              const xs = "x".repeat(Math.min(3, Math.max(1, len - 1)));
              return keep + xs;
            } else {
              // นามสกุล: เก็บ 3 ตัวท้าย ถ้ามี แทนที่กลางด้วย x
              if (len <= 1) return "x".repeat(len);
              const last1 = p.slice(-1);
              const xs = "x".repeat(len - 1);
              return xs + last1;
            }
          });
          // รักษช่องว่างเดิม
          return masked.join(" ");
        };

        const maskPhone = (p) => {
          if (!p) return "";
          const s = String(p).replace(/\s+/g, "");
          if (s.length <= 3) return s.replace(/.(?=.)/g, "x");
          const first2 = s.slice(0, 2);
          const last1 = s.slice(-1);
          const mid = "x".repeat(Math.max(0, s.length - 3));
          return first2 + mid + last1;
        };

        const maskLine = (v) => (v ? "xxx" : "");


        // --- prepare fields ---
        const rawOwner = item.owner || "";
        const rawAgent = item.agent || "";
        const owner = esc(rawOwner);
        const agent = esc(rawAgent);

        // ถ้าเป็นนายหน้า ให้แสดงนายหน้าเต็ม ถ้าไม่ใช่ (เจ้าของ) ให้ปิดชื่อ
        const title = agent ? `${agent} (นายหน้า)` : maskName(owner);

        const area = this.unformatDecimal(item.size ?? item.area) ?? 0;
        const frontage = this.unformatDecimal(item.frontage ?? item.width) ?? null;
        const road = this.unformatDecimal(item.roadWidth ?? item.road) ?? null;
        const pricePer = this.unformatDecimal(item.pricePerSqw ?? item.price) ?? null;
        const total = this.unformatDecimal(item.totalPrice) ?? (pricePer && area ? Math.round(pricePer * area) : null);

        // RNW (ไร่/งาน/วา)
        const { rai, ngan, wah } = (() => {
          try {
            return this.rnwFromSize(area);
          } catch (e) {
            return { rai: "", ngan: "", wah: "" };
          }
        })();

        const fmt = (v, unit) => {
          if (v == null || v === "") return "-";
          const s = unit === "money"
            ? (typeof this.formatMoney === "function" ? this.formatMoney(v) : this.fmt2(v))
            : (typeof this.fmt2 === "function" ? this.fmt2(v) : v);
          return esc(s);
        };

        // apply masking: เจ้าของปิดชื่อ (ถ้ามีนายหน้า ให้ปิดเจ้าของเสมอ)
        const displayOwner = agent ? maskName(rawOwner) : maskName(rawOwner);
        const displayAgent = agent ? agent : "-";

        // If listing has an agent, show the phone number in full (do not mask);
        // otherwise mask the phone for privacy.
        const phoneRaw = String(item.phone || "");
        const phone = rawAgent ? esc(phoneRaw) : esc(maskPhone(phoneRaw));
        const lineId = maskLine(item.lineId || "");
        const landFrame = esc(item.landFrame || "");
        const deed = esc(item.deedInformation || item.detail || "");
        const jsUid = String(item.ownerUid || item.ownerUid || '').replace(/'/g, "\\'");
        const jsName = String(displayOwner || '').replace(/'/g, "\\'");

        const html = `
          <div style="
            min-width:300px;
            max-width:360px;
            font-family: Inter, Arial, Helvetica, sans-serif;
            color:#e6eef8;
            background:linear-gradient(180deg,#0b1220 0%, #071022 100%);
            border-radius:12px;
            box-shadow:0 10px 30px rgba(2,6,23,0.75);
            padding:12px;
            border: none;
            overflow: visible;
          ">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
              <div style="font-weight:800;font-size:14px;color:#f8fafc;line-height:1.05">${esc(title)}</div>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:10px">
              <div style="flex:1;display:flex;flex-direction:column;gap:8px">
                <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:10px;display:flex;flex-direction:column;overflow:visible">
                  <div style="font-size:12px;color:#9fb6cf;margin-bottom:4px">ขนาดที่ดิน (ตร.วา)</div>
                  <div style="font-weight:700;font-size:18px;color:#e6fff7">${fmt(area)}</div>
                </div>

                <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:10px;display:flex;flex-direction:column;overflow:visible">
                  <div style="font-size:12px;color:#9fb6cf;margin-bottom:4px">หน้ากว้างติดถนน (ม.)</div>
                  <div style="font-weight:700;font-size:16px;color:#bfe1ff">${fmt(frontage)}</div>
                </div>
              </div>

              <div style="width:120px;display:flex;flex-direction:column;gap:8px">
                <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:10px;text-align:center;overflow:visible">
                  <div style="font-size:12px;color:#9fb6cf">ขนาด (ไร่/งาน/วา)</div>
                  <div style="font-weight:700;font-size:14px;color:#e6fff7">${esc(rai)} / ${esc(ngan)} / ${esc(wah)}</div>
                </div>

                <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:10px;text-align:center;overflow:visible">
                  <div style="font-size:12px;color:#9fb6cf">ขนาดถนน (ม.)</div>
                  <div style="font-weight:700;font-size:14px;color:#e7d5ff">${fmt(road)}</div>
                </div>
              </div>
            </div>

            <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
              <div style="flex:1;background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));padding:10px;border-radius:10px;overflow:visible">
                <div style="font-size:12px;color:#9fb6cf">ราคา/ตร.วา</div>
                <div style="font-weight:800;font-size:16px;color:#e7d5ff">${fmt(pricePer, 'money')} บ.</div>
              </div>
              <div style="flex:1;background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));padding:10px;border-radius:10px;overflow:visible">
                <div style="font-size:12px;color:#9fb6cf">ราคารวม</div>
                <div style="font-weight:800;font-size:16px;color:#bfe1ff">${fmt(total, 'money')} บ.</div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px">

              <div style="display:flex;gap:8px">
                <div style="flex:1">
                  <div style="font-size:12px;color:#9fb6cf">โทร</div>
                  <div style="font-weight:700;color:#e6fff7">${esc(phone) || '-'}</div>
                </div>
                <div style="flex:1">
                  <div style="font-size:12px;color:#9fb6cf">LINE ID</div>
              <div style="font-weight:700;color:#e6fff7">${esc(lineId) || '-'}</div>
                </div>
              </div>
            </div>

            ${landFrame ? `<div style="font-size:12px;color:#9fb6cf;margin-bottom:6px">กรอบที่ดิน</div>
              <div style="background:rgba(255,255,255,0.02);padding:8px;border-radius:8px;color:#e6eef8;font-size:13px;margin-bottom:8px;overflow:visible">${landFrame}</div>` : ""}

            ${deed ? `<div style="font-size:12px;color:#9fb6cf;margin-bottom:4px">ข้อมูลโฉนด / ระวาง</div>
              <div style="background:rgba(255,255,255,0.02);padding:8px;border-radius:8px;color:#cfe8ff;font-size:12px;max-height:none;overflow:visible">${deed}</div>` : ""}

            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px">
              ${item.ownerUid ? `<a href="javascript:void(0)" onclick="window.openChatWith('${jsUid}','${jsName}');return false" style="background:linear-gradient(90deg,#06b6d4,#0ea5e9);color:#071029;padding:8px 12px;border-radius:10px;font-weight:700;text-decoration:none;font-size:13px">แชทผู้ขาย</a>` : ''}
              <a href="javascript:void(0)" style="background:linear-gradient(90deg,#7c3aed,#5eead4);color:#071029;padding:8px 12px;border-radius:10px;font-weight:700;text-decoration:none;font-size:13px">ดูรายละเอียด</a>
            </div>
          </div>
        `.trim();

        return html;
      } catch (e) {
        // fallback: escape minimal เพื่อความปลอดภัย
        try {
          return String(item.detail || item.title || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        } catch (_) {
          return String(item.detail || item.title || "");
        }
      }
    },

    renderLandsOnMap() {
      if (!this.map) return;

      // ล้าง overlay เดิม
      try { this.landOverlays.forEach(o => this.map.Overlays.remove(o)); }
      catch (e) { console.debug("renderLandsOnMap: remove overlays failed:", e); }
      this.landOverlays = [];

      // ใช้ผลกรองถ้ามี ไม่งั้นใช้ทั้งหมด
      const lands =
        (this.filteredLands && this.filteredLands.length
          ? this.filteredLands
          : this.savedLands) || [];

      // ปักหมุด + วาด polygon ของทุกแปลง
      lands.forEach((land) => {
        // --- marker (centroid หรือ fallback ไป location) ---
        let markerLoc = null;
        try {
          if (land.geometry?.type === "Polygon" && Array.isArray(land.geometry.coordinates)) {
            const pts = land.geometry.coordinates.map(([lon, lat]) => ({ lon, lat }));
            if (pts.length >= 3) {
              let area = 0, cx = 0, cy = 0;
              for (let i = 0; i < pts.length; i++) {
                const a = pts[i], b = pts[(i + 1) % pts.length];
                const f = (a.lon * b.lat - b.lon * a.lat);
                area += f; cx += (a.lon + b.lon) * f; cy += (a.lat + b.lat) * f;
              }
              area *= 0.5;
              markerLoc = area ? { lon: cx / (6 * area), lat: cy / (6 * area) } : pts[0];
            }
          }
        } catch (e) { }

        if (!markerLoc && land.location && typeof land.location.lon === "number" && typeof land.location.lat === "number") {
          markerLoc = land.location;
        }
        if (markerLoc) {
          const m = new window.longdo.Marker(markerLoc, {
            /* title: land.owner || land.agent + " (นายหน้า)" || "แปลงที่ดิน", */
            detail: this.makeMarkerDetailHtml(land),

            visibleRange: { min: 7, max: 20 },
            icon: { url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path d='M12 2C7.58 2 4 5.58 4 10c0 5.25 5.4 10.58 7.2 12.19a1.2 1.2 0 0 0 1.6 0C14.6 20.58 20 15.25 20 10c0-4.42-3.58-8-8-8z' fill='rgba(255,255,255,0.85)' stroke='%239ca3af' stroke-width='1'/><circle cx='12' cy='10' r='3' fill='%239ca3af'/></svg>", size: { width: 28, height: 28 }, offset: { x: 14, y: 28 } },
          });
          m.__land = land;
          this.map.Overlays.add(m);
          this.landOverlays.push(m);
        }

        // --- polygon ---
        if (land.geometry?.type === "Polygon" && Array.isArray(land.geometry.coordinates)) {
          const pts = land.geometry.coordinates.map(([lon, lat]) => ({ lon, lat }));
          if (pts.length >= 3) {
            const poly = new window.longdo.Polygon(pts, {
              lineWidth: 2,
              lineColor: 'rgba(255,215,0,0.9)',   // เหลือง
              fillColor: 'rgba(255,215,0,0.25)',
            });
            poly.__land = land;
            this.map.Overlays.add(poly);
            this.landOverlays.push(poly);
          }
        }
      });
    },

    renderFloodsOnMap() {
      if (!this.map) return;

      // เคลียร์ overlay น้ำท่วมเดิมทั้งหมด
      try { this.floodOverlays.forEach(ov => this.map.Overlays.remove(ov)); } catch (_) { }
      this.floodOverlays = [];

      const zones = this.savedFloods || [];
      zones.forEach(z => {
        if (z?.geometry?.type === "Polygon" && Array.isArray(z.geometry.coordinates)) {
          const pts = z.geometry.coordinates.map(([lon, lat]) => ({ lon, lat }));
          if (pts.length >= 3) {
            // สไตล์ตาม level + waterAmount ปัจจุบัน
            const oldAmount = this.waterAmount;
            this.waterAmount = z.waterAmount ?? this.waterAmount;  // ใช้ค่าที่บันทึกไว้เป็น base
            const style = this.getFloodStyle(z.level || 'medium');
            this.waterAmount = oldAmount;

            const poly = new window.longdo.Polygon(pts, {
              lineWidth: 2,
              lineColor: style.lineColor,
              fillColor: style.fillColor,
            });
            poly.__isFlood = true;
            poly.__points = pts;
            poly._onMap = false;
            poly.__flood = {
              id: z.id,
              level: z.level || 'medium',
              ownerUid: z.ownerUid || null,
            };

            this.attachFloodEvents(poly);

            if (this.showFloodLayer) {
              this.map.Overlays.add(poly);
              poly._onMap = true;
            }
            this.floodOverlays.push(poly);
          }
        }
      });
    },

    // ...existing code...
    initMap() {
      // bind global handlers if available
      try { if (typeof this.bindGlobalErrorHandlers === "function") this.bindGlobalErrorHandlers(); } catch (e) { }

      try {
        if (typeof window.longdo === "undefined") {
          console.warn("longdo not loaded yet, retrying initMap...");
          setTimeout(() => this.initMap(), 500);
          return;
        }

        // prefer ESRI imagery (satellite + roads/labels) as the default base layer
        let baseLayer = null;
        try {
          // Try common ESRI imagery names; some Longdo builds accept different keys
          if (window.longdo.Layers && typeof window.longdo.Layers.ESRI === 'function') {
            try { baseLayer = window.longdo.Layers.ESRI('imagery'); } catch (e1) { }
            if (!baseLayer) try { baseLayer = window.longdo.Layers.ESRI('satellite'); } catch (e2) { }
            if (!baseLayer) try { baseLayer = window.longdo.Layers.ESRI('World_Imagery'); } catch (e3) { }
            if (!baseLayer) try { baseLayer = window.longdo.Layers.ESRI('road'); } catch (e4) { }
          }

          // Fallbacks: Longdo built-in satellite / hybrid
          if (!baseLayer && window.longdo.Layers && window.longdo.Layers.SATELLITE) {
            baseLayer = (typeof window.longdo.Layers.SATELLITE === 'function')
              ? window.longdo.Layers.SATELLITE()
              : window.longdo.Layers.SATELLITE;
          }
          if (!baseLayer && window.longdo.Layers && window.longdo.Layers.HYBRID) {
            baseLayer = (typeof window.longdo.Layers.HYBRID === 'function')
              ? window.longdo.Layers.HYBRID()
              : window.longdo.Layers.HYBRID;
          }
        } catch (e) {
          console.warn('failed to init ESRI imagery base, will fallback:', e);
        }

        // create map with defensive try/catch
        try {
          this.map = new window.longdo.Map({
            placeholder: document.getElementById("map"),
            language: "th",
            ui: window.longdo.UiComponent?.Full,
            layer: baseLayer,
          });
        } catch (err) {
          console.error("longdo.Map init failed with layer, retry without layer:", err);
          try {
            this.map = new window.longdo.Map({
              placeholder: document.getElementById("map"),
              language: "th",
            });
          } catch (err2) {
            console.error("longdo.Map init fallback failed:", err2);
            // show a small message in UI
            try {
              const el = document.getElementById("map");
              if (el) el.innerHTML = "<div style='color:#fff;padding:12px;background:#800'>Map init failed — see console</div>";
            } catch (_) { }
            return;
          }
        }

        // basic map setup (safe ops)
        try {
          this.map.location(
            { lon: this.currentLocation.lon, lat: this.currentLocation.lat, includePolygon: false },
            true
          );
          this.map.zoom(this.currentZoom, true);
        } catch (e) {
          console.warn("map.location/zoom warning:", e);
        }

        // reflect the chosen default base (prefer ESRI imagery)
        this.selectedMapType = (this.selectedMapType || 'esri-imagery');

        try { this.initDolWms_Longdo(); } catch (e) { console.warn("initDolWms_Longdo failed", e); }
        try { this.applyDolVisibility(); } catch (e) { console.warn("applyDolVisibility failed", e); }

        // Add markers after map ready
        try {
          this.map.Event.bind("ready", () => {
            console.log("Map is ready, adding markers...");
            try { this.addMarkersToMap(); } catch (e) { console.error("addMarkersToMap failed", e); }

            // Try to force ESRI imagery as base if available (try several common keys)
            try {
              const tryEsriKeys = [
                'imagery', 'satellite', 'World_Imagery', 'satellite-roads', 'road',
                'ดาวเทียม', 'ถนน', 'ESRI - ดาวเทียม', 'ESRI - ถนน', 'esri.satellite'
              ];
              if (window.longdo?.Layers && typeof window.longdo.Layers.ESRI === 'function') {
                for (const k of tryEsriKeys) {
                  try {
                    const layer = window.longdo.Layers.ESRI(k);
                    if (layer) {
                      try {
                        if (this.map.Layers?.setBase) this.map.Layers.setBase(layer);
                        else if (this.map.Layers?.base) this.map.Layers.base(layer);
                        this.selectedMapType = 'esri-' + String(k).replace(/\s+/g, '-').toLowerCase();
                        console.log('ESRI base set with key:', k);
                        break;
                      } catch (inner) { console.debug('setBase with ESRI key failed', k, inner); }
                    }
                  } catch (_) { /* try next */ }
                }
              }
            } catch (e) { console.debug('ESRI base detection routine failed', e); }

            // Defensive cleanup: remove Longdo attribution/logo nodes if present.
            // CSS rules already attempt to hide these, but some builds inject
            // elements in ways CSS may not catch — remove as a JS fallback.
            try {
              const candidates = [
                '.ldmap_logo', '.ldmap_footer', '.ldmap_attribution',
                '.ldmap_credit', '.ldmap_copyright', '.ldmap_poweredby',
                '.ldmap_tile_copyright', '.ldmap_attrib',
                'a[href*="longdo"]', 'img[alt*="Longdo"]'
              ];
              candidates.forEach((sel) => {
                document.querySelectorAll(sel).forEach((n) => { try { n.remove(); } catch (_) { n.style && (n.style.display = 'none'); } });
              });
            } catch (e) {
              console.debug('cleanup remove attribution failed:', e);
            }
          });
        } catch (e) { console.warn("binding ready event failed", e); }

        // Click handler (defensive)
        try {
          this.map.Event.bind("click", (ev) => {
            try {
              this.showMarkerInfo = false;
              if (!this.drawMode && !this.floodMode) {
                this.clearSelectedLand();
                return;
              }
              const p = this.getClickLocation ? this.getClickLocation(ev) : null;
              if (!p) return;
              if (this.drawMode) {
                this.drawPoints.push({ lon: p.lon, lat: p.lat });
                this.redrawDrawing();
              } else if (this.floodMode) {
                this.floodPoints.push({ lon: p.lon, lat: p.lat });
                this.redrawFloodDrawing();
              }
              try {
                const dot = new window.longdo.Circle(p, 1, { fillColor: "rgba(0,0,0,0.7)" });
                this.map.Overlays.add(dot);
                setTimeout(() => this.map.Overlays.remove(dot), 500);
              } catch (_) { }
            } catch (inner) { console.error("map click handler error:", inner); }
          });
        } catch (e) { console.warn("binding click event failed", e); }

        // expose selectSaleType for popup buttons if present
        try { window.selectSaleType = this.selectSaleType.bind(this); } catch (e) { }
        try { window.openChatWith = this.openChatWith?.bind(this) || (() => { }); } catch (e) { }

        // hide some UI components if available (safe)
        try { this.map.Ui?.Zoombar?.visible(false); this.map.Ui?.DPad?.visible(false); } catch (e) { }

      } catch (e) {
        console.error("initMap outer error:", e);
      }
    },

    // หาพิกัดศูนย์กลางของแปลง (centroid) หรือพิกัด marker ที่บันทึกไว้
    getLandCenter(land) {
      // geometry → centroid
      if (land?.geometry?.type === "Polygon" && Array.isArray(land.geometry.coordinates)) {
        const pts = land.geometry.coordinates.map(([lon, lat]) => ({ lon, lat }));
        if (pts.length >= 3) {
          let area = 0, cx = 0, cy = 0;
          for (let i = 0; i < pts.length; i++) {
            const a = pts[i], b = pts[(i + 1) % pts.length];
            const f = (a.lon * b.lat - b.lon * a.lat);
            area += f; cx += (a.lon + b.lon) * f; cy += (a.lat + b.lat) * f;
          }
          area *= 0.5;
          if (area) return { lon: cx / (6 * area), lat: cy / (6 * area) };
          return pts[0];
        }
      }
      // fallback → location ที่บันทึกไว้
      if (land?.location?.lon != null && land?.location?.lat != null) {
        return { lon: land.location.lon, lat: land.location.lat };
      }
      // สุดท้าย → พิกัดกลางปัจจุบัน
      return { lon: this.currentLocation.lon, lat: this.currentLocation.lat };
    },

    addMarkersToMap() {
      if (!this.map) return;

      // เคลียร์หมุดเดิม
      this.clearAllMarkers();

      // เช็คว่า layer หมุดเปิดอยู่ไหม
      const markersLayer = this.availableLayers.find((l) => l.id === 1);
      if (!markersLayer || !markersLayer.visible) return;

      // เพิ่มหมุดลงแผนที่
      this.visibleMarkers.forEach((markerData) => {
        const marker = new window.longdo.Marker(markerData.location, {
          title: markerData.title,
          detail: markerData.detail,
          icon: markerData.icon || {
            url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path d='M12 2C7.58 2 4 5.58 4 10c0 5.25 5.4 10.58 7.2 12.19a1.2 1.2 0 0 0 1.6 0C14.6 20.58 20 15.25 20 10c0-4.42-3.58-8-8-8z' fill='rgba(255,255,255,0.85)' stroke='%239ca3af' stroke-width='1'/><circle cx='12' cy='10' r='3' fill='%239ca3af'/></svg>",
            size: { width: 32, height: 32 },
            offset: { x: 16, y: 32 },
          },
          visibleRange: { min: 7, max: 20 },
          draggable: false,
          weight: window.longdo.OverlayWeight
            ? window.longdo.OverlayWeight.Top
            : null,
          // ❌ ไม่ใส่ popup:{} เพื่อให้ใช้ popup มาตรฐานของ Longdo
        });

        // เก็บอ้างอิงหมุด
        this.mapMarkers.push({
          data: markerData,
          marker: marker,
        });

        // เพิ่มหมุดลงบนแผนที่
        this.map.Overlays.add(marker);
      });

      // event คลิก overlay (เหมือนเดิม ไม่ต้องแก้)
      if (this.map.Event && this.map.Event.bind) {
        this.map.Event.bind("overlayClick", (overlay) => {
          if (overlay && overlay.__land) {
            this.onLandOverlayClick(overlay.__land, overlay);
            return;
          }
          if (overlay && overlay.__isFlood) {
            if (!this.drawMode && !this.floodMode) {
              this.selectFloodPolygon(overlay);
            }
            return;
          }
          const markerItem = this.mapMarkers.find(
            (item) => item.marker === overlay
          );
          if (markerItem) {
            this.onMarkerClick(markerItem.data, overlay);
          }
        });
      }
    },


    onMarkerClick(markerData) {
      this.selectedMarker = markerData;
      this.showMarkerInfo = true;

      // Optional: Center on clicked marker
      if (markerData.location) {
        this.map.location(markerData.location, true);
      }

      console.log("Marker clicked:", markerData);
    },

    clearAllMarkers() {
      if (!this.map) return;

      this.mapMarkers.forEach((item) => {
        this.map.Overlays.remove(item.marker);
      });
      this.mapMarkers = [];
    },

    toggleMarkersLayer() {
      const markersLayer = this.availableLayers.find((l) => l.id === 1);
      if (markersLayer) {
        if (markersLayer.visible) {
          this.addMarkersToMap();
        } else {
          this.clearAllMarkers();
        }
      }
    },

    addNewMarker(location) {
      const newMarker = {
        id: this.markers.length + 1,
        location: location,
        title: `พื้นที่ใหม่ ${this.markers.length + 1}`,
        detail: "คลิกเพื่อแก้ไขรายละเอียด",
        icon: {
          url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path d='M12 2C7.58 2 4 5.58 4 10c0 5.25 5.4 10.58 7.2 12.19a1.2 1.2 0 0 0 1.6 0C14.6 20.58 20 15.25 20 10c0-4.42-3.58-8-8-8z' fill='rgba(255,255,255,0.85)' stroke='%239ca3af' stroke-width='1'/><circle cx='12' cy='10' r='3' fill='%239ca3af'/></svg>",
          size: { width: 32, height: 32 },
          offset: { x: 16, y: 32 },
        },
      };

      this.markers.push(newMarker);
      this.addMarkersToMap();
    },

    centerOnMarker(marker) {
      if (this.map && marker.location) {
        this.map.location(marker.location, true);
        this.map.zoom(15, true);
      }
    },

    centerBangkok() {
      if (this.map) {
        this.map.location(
          {
            lon: 100.5234,
            lat: 13.7563,
            includePolygon: false,
          },
          true
        );
        this.currentLocation = { lat: 13.7563, lon: 100.5234 };
        this.map.zoom(12, true);
      }
    },

    reloadAPI() {
      console.log("Reloading API...");
      this.initMap();
    },
    // โหลด KML จาก URL
    async loadKmlFromUrl(url) {
      if (!this.map) return;
      if (!url) { alert('กรุณาระบุ URL ของไฟล์ KML'); return; }

      try {
        // ดึงไฟล์ KML
        const res = await fetch(url, { cache: 'no-store' });
        const kmlText = await res.text();

        // ล้างของเดิมก่อน
        this.clearKml();

        // แปลง + วาดด้วย helper (สร้างจาก script ใน index.html)
        const result = window.kmlToLongdoMap(this.map, kmlText, {
          // ปรับสไตล์ geometry ที่มากับ KML ได้
          geometryOptions: {
            lineWidth: 2,
            lineColor: 'rgba(255,215,0,0.95)',
            fillColor: 'rgba(255,215,0,0.25)',
          },
          // สไตล์ Marker (ถ้า KML มีจุด)
          markerOptions: {
            icon: {
              url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path d='M12 2C7.58 2 4 5.58 4 10c0 5.25 5.4 10.58 7.2 12.19a1.2 1.2 0 0 0 1.6 0C14.6 20.58 20 15.25 20 10c0-4.42-3.58-8-8-8z' fill='rgba(255,255,255,0.85)' stroke='%239ca3af' stroke-width='1'/><circle cx='12' cy='10' r='3' fill='%239ca3af'/></svg>",
              size: { width: 28, height: 28 },
              offset: { x: 14, y: 28 },
            },
            visibleRange: { min: 6, max: 20 },
          },
        });

        this.kmlState = result;
        this.kmlOverlays = (result && Array.isArray(result.overlays)) ? result.overlays : [];
        this.kmlFeatures = Array.isArray(result?.features) ? result.features : [];

        // zoom ให้พอดีขอบเขต
        if (result?.bound) this.map.bound(result.bound);
        this.applyKmlFiltersUsingUI();

        // ถ้าต้อง snap กับจุด KML ด้วย ก็อัปเดตจุด snap
        this.updateSnapPoints();

      } catch (e) {
        console.error('loadKmlFromUrl error:', e);
        alert('โหลด KML ไม่สำเร็จ: ' + (e?.message || e));
      }
    },

    // เคลียร์ KML ออกจากแผนที่
    clearKml() {
      if (!this.map) return;

      try {
        if (this.kmlState?.overlays?.length) {
          this.kmlState.overlays.forEach(ov => this.map.Overlays.remove(ov));
        } else if (this.kmlOverlays?.length) {
          this.kmlOverlays.forEach(ov => this.map.Overlays.remove(ov));
        }
      } catch (e) {
        console.debug('clearKml remove overlays failed:', e);
      }

      this.kmlState = null;
      this.kmlOverlays = [];
    },

    // รองรับอัปโหลดไฟล์ .kml จากเครื่องผู้ใช้
    async importKmlFile(evt) {
      // NOTE: ตรงนี้คือ placeholder เดิมของคุณ ผมเติมให้เป็นของจริงแล้ว
      // ใช้ <input type="file" accept=".kml"> ส่ง event นี้เข้ามา
      const file = evt?.target?.files?.[0];
      if (!file) return;

      try {
        const kmlText = await file.text();
        this.clearKml();

        const result = window.kmlToLongdoMap(this.map, kmlText, {
          geometryOptions: {
            lineWidth: 2,
            lineColor: 'rgba(0,0,0,0.9)',
            fillColor: 'rgba(30,144,255,0.25)',
          },
          markerOptions: {
            icon: {
              url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path d='M12 2C7.58 2 4 5.58 4 10c0 5.25 5.4 10.58 7.2 12.19a1.2 1.2 0 0 0 1.6 0C14.6 20.58 20 15.25 20 10c0-4.42-3.58-8-8-8z' fill='rgba(255,255,255,0.85)' stroke='%239ca3af' stroke-width='1'/><circle cx='12' cy='10' r='3' fill='%239ca3af'/></svg>",
              size: { width: 28, height: 28 },
              offset: { x: 14, y: 28 },
            },
            visibleRange: { min: 6, max: 20 },
          },
        });

        this.kmlState = result;
        this.kmlOverlays = (result && Array.isArray(result.overlays)) ? result.overlays : [];
        this.kmlFeatures = Array.isArray(result?.features) ? result.features : [];
        if (result?.bound) this.map.bound(result.bound);
        this.applyKmlFiltersUsingUI();
        this.updateSnapPoints();
      } catch (e) {
        console.error('importKmlFile error:', e);
        alert('อ่านไฟล์ KML ไม่สำเร็จ: ' + (e?.message || e));
      } finally {
        // รีเซ็ตค่า input ให้เลือกไฟล์เดิมซ้ำได้
        try { evt.target.value = ''; } catch (_) { }
      }
    },

    redrawDrawing() {
      if (!this.map) return;
      try { if (this.drawPolyline) this.map.Overlays.remove(this.drawPolyline); }
      catch (e) { console.debug("redraw: rm polyline fail", e); }
      try { if (this.drawPolygon) this.map.Overlays.remove(this.drawPolygon); }
      catch (e) { console.debug("redraw: rm polygon fail", e); }

      if (this.drawPoints.length >= 2) {
        this.drawPolyline = new window.longdo.Polyline(this.drawPoints, {
          lineWidth: 3,
          lineColor: "rgba(0,0,0,0.6)",
        });
        this.map.Overlays.add(this.drawPolyline);
      }
    },

    startDrawing() {
      this.drawMode = true;
      this.drawPoints = [];
      this.redrawDrawing();
      this.updateSnapPoints();
      try { document.getElementById('map').style.cursor = 'crosshair'; } catch (e) { }
    },
    finishDrawing() {
      if (!this.map) return;
      if (this.drawPoints.length < 3) { alert("ต้องคลิกอย่างน้อย 3 จุด"); return; }
      try { if (this.drawPolyline) this.map.Overlays.remove(this.drawPolyline); } catch (e) { }
      try { if (this.drawPolygon) this.map.Overlays.remove(this.drawPolygon); } catch (e) { }
      this.drawPolygon = new window.longdo.Polygon(this.drawPoints, {
        lineWidth: 2, lineColor: "rgba(30,144,255,0.9)", fillColor: "rgba(30,144,255,0.25)",
      });
      this.map.Overlays.add(this.drawPolygon);
      this.drawMode = false;
      this.updateSnapPoints();
      try { document.getElementById('map').style.cursor = 'default'; } catch (e) { }
    },
    clearDrawing() {
      this.drawMode = false;
      this.drawPoints = [];
      try { if (this.drawPolyline) this.map.Overlays.remove(this.drawPolyline); } catch (e) { }
      try { if (this.drawPolygon) this.map.Overlays.remove(this.drawPolygon); } catch (e) { }
      this.drawPolyline = null;
      this.drawPolygon = null;
      this.updateSnapPoints();
      try { document.getElementById('map').style.cursor = 'default'; } catch (e) { }
    },

    getClickLocation(ev) {
      // กรณีส่ง lon/lat มาโดยตรง
      if (ev && typeof ev.lon === 'number' && typeof ev.lat === 'number') {
        return { lon: ev.lon, lat: ev.lat };
      }
      // กรณีส่งเป็นพิกเซล (x,y) ให้แปลงเป็นพิกัด
      if (ev && typeof ev.x === 'number' && typeof ev.y === 'number' && this.map?.location) {
        try {
          const loc = this.map.location(ev);
          if (loc && typeof loc.lon === 'number' && typeof loc.lat === 'number') return loc;
        } catch (e) { console.debug('getClickLocation: map.location(point) failed', e); }
      }
      // fallback: ใช้ pointer mode
      try {
        const loc = this.map.location(window.longdo?.LocationMode?.Pointer);
        if (loc && typeof loc.lon === 'number' && typeof loc.lat === 'number') return loc;
      } catch (e) { console.debug('getClickLocation: Pointer mode failed', e); }
      return null;
    },

    centerTo(lon, lat, zoom = 17) {
      if (!this.map) return;

      try {
        this.map.location({ lon, lat, includePolygon: false });
        if (typeof this.map.zoom === "function") this.map.zoom(zoom);
      } catch (e) {
        console.debug("[SEARCH] centerTo error:", e);
      }

      /* try {
        if (this.myMarker) this.map.Overlays.remove(this.myMarker);
        this.myMarker = new window.longdo.Marker({ lon, lat });
        this.map.Overlays.add(this.myMarker);
      } catch (e) {
        console.debug("[SEARCH] marker add failed:", e);
      } */
    },

    locateByGPS() {
      if (!("geolocation" in navigator)) {
        alert("เบราเซอร์นี้ไม่รองรับการระบุตำแหน่ง (Geolocation)");
        return;
      }
      this.locating = true;
      this.geolocError = null;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          this.currentLocation = { lat: latitude, lon: longitude };
          this.centerTo(longitude, latitude, 18); // NOTE: centerTo(lon, lat)
          this.showSearch = false;
          this.locating = false;
        },
        (err) => {
          this.locating = false;
          this.geolocError = err?.message || "ขอสิทธิ์ตำแหน่งไม่สำเร็จ";
          alert("ไม่สามารถระบุตำแหน่งได้: " + this.geolocError);
        },
        { enableHighAccuracy: true, maximumAge: 20000, timeout: 10000 }
      );
    },

    async ensureLongdoServices() {
      if (window.longdo?.Services?.search) return true;

      // เผื่อ services กำลังโหลด (จาก main.js) รอสั้น ๆ ก่อน
      for (let i = 0; i < 15; i++) {
        if (window.longdo?.Services?.search) return true;
        await new Promise((r) => setTimeout(r, 200));
      }

      // ยังไม่มา → inject script ด้วย URL ที่ถูกต้อง
      const urls = [
        "https://api.longdo.com/services",
        "https://api.longdo.com/services/",
      ];

      for (const src of urls) {
        try {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.onload = resolve;
            s.onerror = () => reject(new Error("services load failed: " + src));
            document.head.appendChild(s);
          });
          if (window.longdo?.Services?.search) return true;
        } catch (e) {
          console.debug("[SEARCH] inject services failed:", src, e);
        }
      }

      return !!window.longdo?.Services?.search;
    },

    async searchPlaceLongdo(q) {
      // 1) พยายามใช้ Services ก่อน
      if (await this.ensureLongdoServices()) {
        return new Promise((resolve) => {
          try {
            window.longdo.Services.search(
              { keyword: q, limit: 5, language: "th" },
              (results) => {
                if (Array.isArray(results) && results.length > 0) {
                  const best = results[0];
                  if (best?.lon != null && best?.lat != null) {
                    this.centerTo(best.lon, best.lat, 17);
                    this.showSearch = false;
                    resolve(true);
                    return;
                  }
                }
                alert("ไม่พบผลลัพธ์จาก Longdo สำหรับ: " + q);
                resolve(false);
              },
              (err) => {
                console.debug("[SEARCH] Services.search error:", err);
                resolve(false); // ให้ไป REST ต่อ
              }
            );
          } catch (e) {
            console.debug("[SEARCH] Services.search exception:", e);
            // ไป REST ต่อ
          }
        });
      }

      // 2) Fallback → REST (ใช้ key เดียวจาก main.js)
      try {
        const KEY = window.__LONGDO_KEY; // ✅ แชร์ key เดียวจาก main.js
        const url =
          `https://search.longdo.com/mapsearch/json/search` +
          `?keyword=${encodeURIComponent(q)}` +
          `&key=${encodeURIComponent(KEY)}` +
          `&limit=5&language=th`;

        const r = await fetch(url);
        const text = await r.text(); // กันกรณีปลายทางตอบ error HTML
        const data = JSON.parse(text); // ถ้าไม่ใช่ JSON จะ throw ไป catch
        const items = Array.isArray(data?.data) ? data.data : [];
        if (items.length && items[0]?.lon != null && items[0]?.lat != null) {
          this.centerTo(items[0].lon, items[0].lat, 17);
          this.showSearch = false;
          return true;
        }
        alert("ไม่พบผลลัพธ์จาก Longdo สำหรับ: " + q);
        return false;
      } catch (e) {
        console.debug("[SEARCH] REST search error:", e);
        alert("ค้นหาไม่สำเร็จ (REST)");
        return false;
      }
    },

    performSearch() {
      const q = (this.searchQuery || "").trim();

      // 1) ช่องว่าง → ใช้ GPS
      if (!q) {
        this.locateByGPS();
        return;
      }

      // 2) รองรับใส่พิกัด "lat, lon"
      const m = q.match(
        /^\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*$/
      );
      if (m) {
        const lat = parseFloat(m[1]);
        const lon = parseFloat(m[2]);
        if (
          isFinite(lat) &&
          isFinite(lon) &&
          Math.abs(lat) <= 90 &&
          Math.abs(lon) <= 180
        ) {
          this.centerTo(lon, lat, 18);
          this.showSearch = false;
          return;
        }
      }

      // 3) ชื่อสถานที่ → ใช้ Longdo (Services → REST)
      this.searchPlaceLongdo(q);
    },

    // --- Snapping helpers ---
    updateSnapPoints() {
      const pts = [];
      // collect all vertices from saved lands
      (this.savedLands || []).forEach((land) => {
        if (land?.geometry?.type === "Polygon" && Array.isArray(land.geometry.coordinates)) {
          land.geometry.coordinates.forEach(([lon, lat]) => pts.push({ lon, lat }));
        }
      });
      // include current drawing points
      if (Array.isArray(this.drawPoints)) pts.push(...this.drawPoints);
      this.snapPoints = pts;
    },
    getSnappedPoint(p) {
      if (!this.snapEnabled || !Array.isArray(this.snapPoints) || !this.snapPoints.length) return p;
      // tolerance in meters depends on zoom
      const zoom = (typeof this.map?.zoom === "function") ? this.map.zoom() : 16;
      const tol = zoom >= 18 ? 8 : zoom >= 16 ? 15 : 30;
      const dist = window.longdo?.Util?.distance;
      if (!dist) return p;
      let best = null, bestD = Infinity;
      for (const q of this.snapPoints) {
        const d = dist([p, q]);
        if (d < bestD) { bestD = d; best = q; }
      }
      return (best && bestD <= tol) ? best : p;
    },

    redrawFloodDrawing() {
      if (!this.map) return;

      try { if (this.floodPolyline) this.map.Overlays.remove(this.floodPolyline); } catch (e) { }
      try { if (this.floodPolygon) this.map.Overlays.remove(this.floodPolygon); } catch (e) { }

      if (this.floodPoints.length >= 2) {
        this.floodPolyline = new window.longdo.Polyline(this.floodPoints, {
          lineWidth: 3,
          lineColor: "rgba(0,90,255,0.5)", // ฟ้าอ่อนสำหรับระหว่างวาด
        });
        this.map.Overlays.add(this.floodPolyline);
      }
    },

    getFloodStyle(level) {
      // base color ต่อระดับ (โทนฟ้า)
      let line = 'rgba(0,90,255,0.95)';
      let baseFillAlpha = 0.22; // ค่าเริ่ม

      switch (String(level)) {
        case 'low':
          line = 'rgba(0,128,255,0.95)';
          baseFillAlpha = 0.16;
          break;
        case 'high':
          line = 'rgba(0,64,160,1)';
          baseFillAlpha = 0.30;
          break;
        case 'medium':
        default:
          line = 'rgba(0,90,255,0.95)';
          baseFillAlpha = 0.22;
          break;
      }

      // ปรับตาม waterAmount (1..5) ให้ทึบขึ้นทีละนิด
      const step = 0.06; // ความทึบเพิ่มต่อระดับ
      const alpha = Math.max(0.10, Math.min(0.65, baseFillAlpha + (this.waterAmount - 1) * step));
      const fill = `rgba(0,120,255,${alpha})`;

      return { lineColor: line, fillColor: fill };
    },

    restyleAllFloodPolygons() {
      if (!this.map) return;

      // เราจะสร้างโพลิกอนใหม่แทนตัวเดิม เพื่อให้สีอัปเดตได้แน่นอน
      this.floodOverlays = this.floodOverlays.map(oldOv => {
        const wasOnMap = !!oldOv._onMap;
        const oldMeta = oldOv.__flood || {};
        const points = oldOv.__points;
        const style = this.getFloodStyle(oldMeta.level || 'medium');

        try { if (wasOnMap) this.map.Overlays.remove(oldOv); } catch (e) { }

        const newOv = new window.longdo.Polygon(points, {
          lineWidth: 2,
          lineColor: style.lineColor,
          fillColor: style.fillColor
        });
        newOv.__isFlood = true;
        newOv.__points = points;
        newOv.__flood = {
          id: oldMeta.id || null,
          level: oldMeta.level || 'medium',
          ownerUid: oldMeta.ownerUid || null,
        };
        newOv._onMap = false;
        this.attachFloodEvents(newOv);

        if (this.showFloodLayer && wasOnMap) {
          this.map.Overlays.add(newOv);
          newOv._onMap = true;
        }
        return newOv;
      });

      // อัปเดตของที่กำลังวาดอยู่ (เส้นชั่วคราวใช้สีคงเดิมพอ)
      if (this.floodPolygon) {
        try { this.map.Overlays.remove(this.floodPolygon); } catch (e) { }
        const style = this.getFloodStyle(this.floodLevel);
        this.floodPolygon = new window.longdo.Polygon(this.floodPoints, {
          lineWidth: 2,
          lineColor: style.lineColor,
          fillColor: style.fillColor
        });
        this.map.Overlays.add(this.floodPolygon);
      }
    },
    attachFloodEvents(poly) {
      // ผูกคลิกกับโพลิกอนน้ำท่วมแต่ละชิ้น
      try {
        poly.Event.bind('click', () => {
          // ห้ามชนกับโหมดกำลังวาดแปลงหรือวาดน้ำท่วม
          if (this.drawMode || this.floodMode) return;
          this.selectFloodPolygon(poly);
        });
      } catch (e) { }
    },

    selectFloodPolygon(poly) {
      if (!this.map) return;

      // ล้างไฮไลท์เดิมก่อน
      this.clearFloodSelection();

      this.selectedFlood = poly;

      // สร้างเส้นไฮไลท์ทับ (เส้นเหลือง ไม่มีสีพื้น)
      const pts = poly.__points || [];
      try {
        this.selectedFloodHighlight = new window.longdo.Polygon(pts, {
          lineWidth: 4,
          lineColor: 'rgba(255,215,0,0.95)', // เหลืองทอง
          fillColor: 'rgba(255,215,0,0.01)',
          weight: window.longdo.OverlayWeight.Top
        });
        this.map.Overlays.add(this.selectedFloodHighlight);
      } catch (e) { }
    },
    clearFloodSelection() {
      if (!this.map) return;
      try {
        if (this.selectedFloodHighlight)
          this.map.Overlays.remove(this.selectedFloodHighlight);
      } catch (e) { }
      this.selectedFloodHighlight = null;
      this.selectedFlood = null;
    },

    }
}