<template>
    <!-- P2P Chat Panel -->
      <div class="chat-popup" v-show="showChat">
        <div class="chat-header">
          <div class="chat-title">
            <h3>P2P Chat</h3>
            <div class="text-xs opacity-70">
              คุณ:
              {{
                userProfile.name || "User-" + (currentUserId || "").slice(0, 6)
              }}
            </div>
          </div>
          <button @click="showChat = false" class="close-btn">×</button>
        </div>

        <!-- ตั้งชื่อ (ครั้งแรก) -->
        <div class="user-profile" v-if="!userProfile.name">
          <input
            type="text"
            v-model="tempUserName"
            placeholder="กรุณาตั้งชื่อของคุณก่อน"
            class="profile-input"
            @keyup.enter="setUserProfile"
          />
          <button @click="setUserProfile" class="btn btn-sm btn-primary">
            ตั้งชื่อ
          </button>
        </div>

        <!-- โหมด รายชื่อ (rooms) -->
        <div v-if="chatMode === 'rooms'" class="rooms-pane">
          <div class="rooms-head">
            <div class="rooms-title">คนออนไลน์ (คลิกเพื่อคุย):</div>
            <span class="badge">{{ onlineUsers.length }}</span>
          </div>

          <div v-if="onlineUsers.length === 0" class="empty-state">
            ยังไม่มีใครออนไลน์
          </div>

          <div v-else class="user-list">
            <button
              v-for="u in onlineUsers"
              :key="u.uid"
              class="user-pill"
              @click="selectUserToChat(u)"
              :title="u.name || 'User-' + u.uid.slice(0, 6)"
            >
              <span class="dot online"></span>
              <span class="name">{{
                u.name || "User-" + u.uid.slice(0, 6)
              }}</span>
            </button>
          </div>
        </div>

        <!-- โหมด แชท (chat) -->
        <div v-else class="chat-pane">
          <div class="chat-subheader">
            <button class="btn btn-xs" @click="backToRooms">← กลับ</button>
            <div class="peer-name">
              {{
                selectedUser?.name ||
                "User-" + (selectedUser?.uid || "").slice(0, 6)
              }}
            </div>
          </div>

          <div class="chat-body" ref="chatBody">
            <div
              v-for="msg in chatMessages"
              :key="msg.id"
              class="chat-msg"
              :class="{
                me: msg.fromUid === currentUserId,
                system: msg.type === 'system',
              }"
            >
              <div class="bubble">
                <div class="meta" v-if="!msg.type">
                  {{ msg.fromName }}
                  <span class="timestamp">{{ formatTime(msg.createdAt) }}</span>
                </div>
                <div class="text">{{ msg.text }}</div>
              </div>
            </div>

            <div v-if="chatMessages.length === 0" class="no-messages">
              เริ่มคุยกันเลย!
            </div>
          </div>

          <div class="typing-indicator" v-if="showTypingIndicator">
            <span class="typing-dots"
              ><span></span><span></span><span></span
            ></span>
            กำลังพิมพ์…
          </div>

          <div class="chat-input-row">
            <input
              type="text"
              v-model="chatInput"
              placeholder="พิมพ์ข้อความ..."
              class="chat-input"
              @keyup.enter="sendMessage"
              @input="handleTyping"
              :disabled="!userProfile.name || !selectedUser"
            />
            <button
              @click="sendMessage"
              class="btn btn-sm btn-primary send-btn"
              :disabled="
                !chatInput.trim() || !userProfile.name || !selectedUser
              "
            >
              ส่ง
            </button>
          </div>
        </div>
    </div>
</template>


<script src="./app-script2.js"></script>
<style>@import "./styles/app.css";</style>