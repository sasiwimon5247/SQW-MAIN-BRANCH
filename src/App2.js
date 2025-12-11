// app-script.js - Enhanced version with marker management
/* eslint-disable no-unused-vars */
import {
  sendChatMessage,
  subscribeChat,
  onAuthChanged,
  subscribeOnlineUsers,
  subscribeP2PChatRooms,
  updateOnlineStatus,
  markMessagesAsRead,
  saveLand,
  deleteLand,
  subscribeLandsAll,
  saveFloodZone,
  deleteFloodZone,
  subscribeFloodZonesAll,
} from "./firebase";

import LoginBar from "./components/LoginBar.vue";
import ModeDisclaimerModal from "./components/Common/ModeDisclaimerModal.vue";
import ModeSelect from "./components/Common/ModeSelect.vue";
import LandDashboard from "./components/Land/LandDashboard.vue";
import LandInfoForm from "./components/Land/LandInfoForm.vue";
import LandListPanel from "./components/Land/LandListPanel.vue";
import MapContainer from "./components/Map/MapContainer.vue";
import MapControls from "./components/Map/MapControls.vue";
import FiltersPanel from "./components/Panels/FiltersPanel.vue";
import P2PChatPanel from "./components/Panels/P2PChatPanel.vue";
import SearchPanel from "./components/Panels/SearchPanel.vue";
import ActionButtons from "./components/Shared/ActionButtons.vue";
import * as turf from "@turf/turf";
/* eslint-disable no-empty */
export default {
  name: "App-ver2",
  components: { LoginBar,
        ModeDisclaimerModal,
        ModeSelect,
        LandDashboard,
        LandInfoForm,
        LandListPanel,
        MapContainer, 
        MapControls,
        FiltersPanel,
        P2PChatPanel,
        SearchPanel,
        ActionButtons
    },
  data() {
    return {
      // --- Flood Zone layer ---
      floodMode: false,
      floodLevel: 'medium',   // 'low' | 'medium' | 'high'
      showFloodLayer: true,
      floodPoints: [],        // [{lon,lat}, ...] ระหว่างวาด
      floodPolyline: null,    // เส้นชั่วคราว
      floodPolygon: null,     // ชิ้นที่กำลังวาดอยู่
      floodOverlays: [],      // โพลิกอนน้ำท่วมที่วาดเสร็จแล้วทั้งหมด
      selectedFlood: null,             // โพลิกอนที่ถูกเลือก
      selectedFloodHighlight: null,    // เส้นไฮไลท์ชิ้นที่เลือก
      waterAmount: 1,
      savedFloods: [],   // โซนน้ำท่วมที่โหลดมาจาก DB (public)
      floodsUnsub: null, // ตัว unsubscribe
      floodSummary: { low: 0, medium: 0, high: 0, none: 0 },
      _floodPolysCache: [],   // แคช polygon ของน้ำท่วม


      currentMode: null,
      raiModel: "",
      nganModel: "",
      wahModel: "",
      _isSyncingSize: false,

      _isSyncingPrice: false,
      _lastPriceSource: 'perSqw', // 'perSqw' | 'total'


      isFormOpen: true,
      isListOpen: true,
      editingLandId: null,

      snapPoints: [],  // points used for snapping

      mapMarkers: [], // Store actual marker objects
      showMarkerInfo: false,
      selectedMarker: null,
      markerInfoPosition: { x: 0, y: 0 },
      map: null,
      selectedMapType: "hybrid",
      dolEnabled: true,
      opacity: 0.5,
      activeTab: "dashboard",
      snapEnabled: true,
      wmsDol: null,
      leafletWmsDol: null,
      snapSettings: {
        red: 180,
        green: 90,
        blue: 90,
      },
      landData: {
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
      },

      savedLands: [],
      filteredLands: [],

      currentLocation: {
        lat: 13.7563,
        lon: 100.5234,
      },
      currentZoom: 12,
      showSearch: false,
      showFilters: false,
      showLayers: false,
      searchQuery: "",
      filters: {
        landType: "",
        roadWidth: "",
        areaMinRai: "",
        areaMin: "",
        areaMax: "",
        areaMaxRai: "",
        priceMin: "",
        priceMax: "",
        totalPriceMin: "",
        totalPriceMax: "",
        frontMin: "",
        frontMax: "",
      },

      availableLayers: [
        { id: 1, name: "ดาวเทียม", visible: true },
        { id: 2, name: "แผนที่", visible: false },
        { id: 3, name: "จราจร", visible: false },
      ],
      // Chat related data
      showChat: false,
      chatMode: "rooms",
      chatMessages: [],
      chatRooms: [], // รายชื่อห้อง/คู่คุย (แบบง่าย)
      chatInput: "",
      currentUserId: null,
      userProfile: {
        name: "",
        joinedAt: null,
      },
      tempUserName: "",
      hasNewMessage: false,
      unreadCount: 0,
      lastSeenMessageId: null,
      onlineUsers: [],
      selectedUser: null,
      currentChatRoom: null,
      showTypingIndicator: false,
      typingTimer: null,
      chatUnsubscribe: null,
      authUnsubscribe: null,
      myMarker: null,
      locating: false,
      geolocError: null,
      onlineStatusInterval: null,
      chatRoomsUnsubscribe: null,
      p2pChatUnsubscribe: null,
      onlineUsersUnsubscribe: null,
      drawMode: false,
      drawPoints: [],        // [{lon,lat}, ...]
      drawPolyline: null,    // เส้นชั่วคราวขณะวาด
      drawPolygon: null,     // โพลิกอนเมื่อกด Finish
      landOverlays: [],      // เก็บ polygon ของแปลงที่โหลดจาก Firebase
      landsUnsub: null,
      showDisclaimer: true,
      // show a centered modal after selecting sale/pledge mode
      showModeDisclaimerModal: false,
      kmlState: null,        // ผลลัพธ์จาก kmlToLongdoMap (overlays, bound)
      kmlOverlays: [],       // สำรองไว้กรณีต้องจัดการเองเป็นรายชิ้น
      kmlFeatures: [],
      bkkRect: null,
      kmlOpacity: 0.6,   // 0–1

    };
  },

  async mounted() {
    this.initMap();
    this.authUnsubscribe = onAuthChanged((u) => {
      // ออกจากระบบ → เคลียร์ state/ยกเลิก subscribe เดิมทั้งหมด
      if (!u) {
        this.resetP2PState();
        this.currentUserId = null;
        this.userProfile = { name: "", joinedAt: null };
        return;
      }
      const ack = localStorage.getItem("ackDisclaimer");
      if (ack === "yes") this.showDisclaimer = false;

      // เปลี่ยนบัญชี → รีเซ็ตก่อน
      const switched = this.currentUserId && this.currentUserId !== u.uid;
      if (switched) this.resetP2PState();

      this.currentUserId = u.uid;

      // เติมชื่อจากบัญชี (ถ้ายังไม่มีชื่อในช่องแชท)
      if (!this.userProfile.name) {
        this.userProfile.name =
          u.displayName || (u.email ? u.email.split("@")[0] : "");
      }

      // ดัน presence ขึ้น พร้อมชื่อ
      this.updateUserOnlineStatus();

      // เริ่ม subscribe ส่วนต่าง ๆ ของ P2P
      this.initP2PFacade();

      // === subscribe lands ของฉัน ===
      this.landsUnsub = subscribeLandsAll((list) => {
        this.savedLands = Array.isArray(list) ? list : [];
        this.renderLandsOnMap();
        this.$nextTick(() => this.checkLandsFloodStatus());
      });
    });
    // === subscribe flood zones (public) ===
    this.floodsUnsub = subscribeFloodZonesAll((list) => {
      this.savedFloods = Array.isArray(list) ? list : [];
      this.renderFloodsOnMap();
      this.$nextTick(() => this.checkLandsFloodStatus());
    });
  },

  beforeUnmount() {
    if (this.onlineUsersUnsubscribe) this.onlineUsersUnsubscribe();
    if (this.p2pChatUnsubscribe) this.p2pChatUnsubscribe();
    if (this.chatRoomsUnsubscribe) this.chatRoomsUnsubscribe();
    if (this.onlineStatusInterval) clearInterval(this.onlineStatusInterval);
    if (this.typingTimer) clearTimeout(this.typingTimer);
    if (this.authUnsubscribe) this.authUnsubscribe();
  },

  computed: {
    visibleMarkers() {
      const q = (this.searchQuery || "").trim().toLowerCase();

      const toNum = (v) => (v === "" || v == null ? null : Number(String(v).replace(/,/g, "")));
      const areaFromDetail = (detail) => {
        if (!detail) return null;
        const m = String(detail).match(/([\d,.]+)/);
        return m ? Number(m[1].replace(/,/g, "")) : null;
      };

      // --- ค่าตัวกรอง ---
      const toSqw = (sqw, rai) => {
        const s = toNum(sqw);
        const r = toNum(rai);
        return (s == null && r == null) ? null : (s || 0) + (r || 0) * 400;
      };
      const aMin = toSqw(this.filters.areaMin, this.filters.areaMinRai);
      const aMax = toSqw(this.filters.areaMax, this.filters.areaMaxRai);
      const pMin = toNum(this.filters.priceMin);
      const pMax = toNum(this.filters.priceMax);
      const tpMin = toNum(this.filters.allPriceMin);
      const tpMax = toNum(this.filters.allPriceMax);
      const fMin = toNum(this.filters.frontMin);
      const fMax = toNum(this.filters.frontMax);

      // รับค่าจาก dropdown ขนาดถนน: ใช้ filters.roadWidth ก่อน ถ้าไม่มีค่อยใช้ filters.landType (โครง UI เก่า)
      const roadSel = (
        this.filters.roadWidth ||
        this.filters.landType ||
        ""
      ).trim();

      // map ค่า dropdown -> ช่วงเมตร
      const roadRange = (sel) => {
        switch (sel) {
          case "lt6":
            return [null, 6];
          case "6-9.99":
            return [6, 9.99];
          case "10-11.99":
            return [10, 11.99];
          case "12-17.99":
            return [12, 17.99];
          case "18-29.99":
            return [18, 29.99];
          case "ge30":
            return [30, null];
          default:
            return [null, null];
        }
      };
      const [rwMin, rwMax] = roadRange(roadSel);

      return (this.markers || []).filter((m) => {
        // ค้นหาข้อความ
        const textOK =
          !q ||
          m.title?.toLowerCase().includes(q) ||
          m.detail?.toLowerCase().includes(q);

        // พื้นที่ (ตร.วา)
        const area = areaFromDetail(m.detail);
        const areaOK =
          (aMin == null || (area != null && area >= aMin)) &&
          (aMax == null || (area != null && area <= aMax));

        // ราคา/ตร.วา (บาท/ตร.วา)
        const ppw = m.pricePerWah != null ? Number(m.pricePerWah) : null;
        const priceOK =
          (pMin == null || (ppw != null && ppw >= pMin)) &&
          (pMax == null || (ppw != null && ppw <= pMax));

        const total =
          m.totalPrice != null
            ? Number(m.totalPrice)
            : (ppw != null && area != null ? ppw * area : null);

        const totalOK =
          (tpMin == null || (total != null && total >= tpMin)) &&
          (tpMax == null || (total != null && total <= tpMax));

        // หน้ากว้าง (เมตร)
        const fg = m.frontage != null ? Number(m.frontage) : null;
        const frontOK =
          (fMin == null || (fg != null && fg >= fMin)) &&
          (fMax == null || (fg != null && fg <= fMax));

        // ถนน (เมตร) จาก m.road
        const road = m.road != null ? Number(m.road) : null;
        const roadOK =
          (rwMin == null || (road != null && road >= rwMin)) &&
          (rwMax == null || (road != null && road <= rwMax));

        return textOK && areaOK && priceOK && totalOK && frontOK && roadOK;
      });
    },

    formatNumber(value) {
      if (value == null || value === '') return '';
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    fmt2(n) {
      if (n == null || n === '') return '';
      const num = typeof n === 'string' ? parseFloat(n.replace(/,/g, '')) : Number(n);
      if (!Number.isFinite(num)) return '';
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },

    fmt(n) {
      if (n == null || n === '') return '';
      const num = typeof n === 'string' ? parseFloat(n.replace(/,/g, '')) : Number(n);
      if (!Number.isFinite(num)) return '';
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },

    unformatNumber(value) {
      if (!value) return '';
      return parseInt(value.replace(/,/g, ''), 10);
    },

  }
}