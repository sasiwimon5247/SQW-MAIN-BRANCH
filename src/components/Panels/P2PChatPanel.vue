<style>@import "../../styles/app.css";</style>

<script>
export default {
  name: "P2PChatPanel",
  props: {
    showChat: {
      type: Boolean,
      default: false,
    },
    chatMode: {
      type: String,
      default: "rooms",
    },
    messages: {
      type: Array,
      default: () => [],
    },
    chatRooms: {
      type: Array,
      default: () => [],
    },
    onlineUsers: {
      type: Array,
      default: () => [],
    },
    selectedUser: {
      type: Object,
      default: null,
    },
    chatInput: {
      type: String,
      default: "",
    },
    tempUserName: {
      type: String,
      default: "",
    },
    userProfile: {
      type: Object,
      default: () => ({ name: "" }),
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  emits: [
    "close",
    "set-profile",
    "select-user",
    "select-room",
    "back-to-rooms",
    "send",
    "update:chatInput",
    "update:tempUserName",
  ],
  methods: {
    formatTime(ts) {
      if (!ts) return "";
      try {
        const d = new Date(ts);
        return d.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (_) {
        return "";
      }
    },
  },
};
</script>

<!-- eslint-disable vue/no-mutating-props -->
<template>
  <!-- แผง P2P Chat -->
  <div class="chat-panel" v-show="showChat">
    <div class="panel-header">
      <h3>P2P Chat</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>

    <!-- ตั้งชื่อผู้ใช้ก่อนเริ่มคุย -->
    <div class="chat-section user-profile">
      <label>ชื่อที่ใช้ในห้องแชท</label>
      <div class="profile-row">
        <input
          class="form-input"
          type="text"
          :value="tempUserName"
          @input="$emit('update:tempUserName', $event.target.value)"
          placeholder="กรอกชื่อที่ต้องการใช้"
        />
        <button class="btn btn-primary" @click="$emit('set-profile')">
          บันทึกชื่อ
        </button>
      </div>
      <div v-if="userProfile && userProfile.name" class="current-name">
        ชื่อปัจจุบัน: <strong>{{ userProfile.name }}</strong>
      </div>
    </div>

    <div class="chat-body-wrapper">
      <!-- ซ้าย: รายชื่อออนไลน์ / ห้องแชท -->
      <div class="chat-sidebar">
        <div class="sidebar-section">
          <div class="section-header">
            <span>ออนไลน์</span>
          </div>
          <div class="user-list">
            <div
              v-for="u in onlineUsers"
              :key="u.uid"
              class="user-item"
              :class="{ active: selectedUser && selectedUser.uid === u.uid }"
              @click="$emit('select-user', u)"
            >
              <span class="status-dot"></span>
              <span>{{ u.name || ('User-' + (u.uid || '').slice(0, 6)) }}</span>
            </div>
            <div v-if="onlineUsers.length === 0" class="empty-text">
              ยังไม่มีผู้ใช้คนอื่นออนไลน์
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="section-header">
            <span>ห้องสนทนา</span>
          </div>
          <div class="room-list">
            <div
              v-for="room in chatRooms"
              :key="room.id || room.otherUid"
              class="room-item"
              @click="$emit('select-room', room)"
            >
              <span>
                {{ room.otherName || ('User-' + (room.otherUid || '').slice(0, 6)) }}
              </span>
              <span v-if="room.unreadCount > 0" class="badge">
                {{ room.unreadCount }}
              </span>
            </div>
            <div v-if="chatRooms.length === 0" class="empty-text">
              ยังไม่มีประวัติการสนทนา
            </div>
          </div>
        </div>
      </div>

      <!-- ขวา: หน้าต่างแชท -->
      <div class="chat-main">
        <div class="chat-main-header">
          <template v-if="selectedUser">
            คุยกับ:
            <strong>{{ selectedUser.name || ('User-' + (selectedUser.uid || '').slice(0, 6)) }}</strong>
          </template>
          <template v-else>
            เลือกผู้ใช้จากด้านซ้ายเพื่อเริ่มสนทนา
          </template>
        </div>

        <div class="chat-messages" ref="chatBody">
          <div
            v-for="(m, idx) in messages"
            :key="idx"
            class="chat-message"
            :class="{ 'me': m.isOwn }"
          >
            <div class="chat-meta">
              <span class="sender">{{ m.fromName || 'ไม่ระบุ' }}</span>
              <span class="time">{{ formatTime(m.createdAt) }}</span>
            </div>
            <div class="chat-text">
              {{ m.text }}
            </div>
          </div>

          <div v-if="messages.length === 0" class="empty-text">
            ยังไม่มีข้อความ
          </div>
        </div>

        <!-- กล่องพิมพ์ข้อความ -->
        <div class="chat-input-row">
          <input
            class="form-input"
            type="text"
            :value="chatInput"
            @input="$emit('update:chatInput', $event.target.value)"
            @keyup.enter="$emit('send')"
            placeholder="พิมพ์ข้อความแล้วกด Enter หรือปุ่มส่ง"
          />
          <button class="btn btn-primary" @click="$emit('send')">
            ส่ง
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
