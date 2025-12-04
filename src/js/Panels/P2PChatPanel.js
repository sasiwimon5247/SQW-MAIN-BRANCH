export default {
    methods: {

    resetP2PState() {
      // ยกเลิกตัวติดตามเก่า
      if (this.onlineUsersUnsubscribe) {
        this.onlineUsersUnsubscribe();
        this.onlineUsersUnsubscribe = null;
      }
      if (this.p2pChatUnsubscribe) {
        this.p2pChatUnsubscribe();
        this.p2pChatUnsubscribe = null;
      }
      if (this.chatRoomsUnsubscribe) {
        this.chatRoomsUnsubscribe();
        this.chatRoomsUnsubscribe = null;
      }
      if (this.onlineStatusInterval) {
        clearInterval(this.onlineStatusInterval);
        this.onlineStatusInterval = null;
      }

      // เคลียร์ state ทั้งหมด
      this.onlineUsers = [];
      this.chatRooms = [];
      this.selectedUser = null;
      this.currentChatRoom = null;
      this.chatMessages = [];
      this.showTypingIndicator = false;
      this.hasNewMessage = false;
      this.unreadCount = 0;
      this.lastSeenMessageId = null;
    },

    async setUserProfile() {
      if (!this.tempUserName.trim()) return;
      this.userProfile.name = this.tempUserName.trim();
      this.userProfile.joinedAt = Date.now();
      await this.updateUserOnlineStatus();
      if (this.currentUserId) this.initP2PFacade(); // เผื่อเพิ่งได้ชื่อ
    },

    async sendMessage() {
      if (!this.chatInput.trim()) return;
      if (!this.userProfile.name) {
        alert('กรุณาตั้งชื่อผู้ใช้ก่อนส่งข้อความ');
        return;
      }
      if (!this.selectedUser || !this.selectedUser.uid) {
        alert('กรุณาเลือกผู้รับก่อนส่งข้อความ');
        return;
      }

      const text = this.chatInput.trim();
      console.log('sendMessage: sending', { to: this.selectedUser.uid, from: this.currentUserId, text });

      try {
        const res = await sendChatMessage(text, this.currentUserId, this.userProfile.name, this.selectedUser.uid);
        console.log('sendMessage: sent', res);
        // clear input after success
        this.chatInput = "";
      } catch (e) {
        console.error('send P2P failed:', e);
        const msg = e?.message || String(e);
        // show a more specific error so user can report it
        alert('ไม่สามารถส่งข้อความได้: ' + msg);
      }
    },

    handleTyping() {
      if (this.typingTimer) clearTimeout(this.typingTimer);
      this.showTypingIndicator = true;
      this.typingTimer = setTimeout(() => {
        this.showTypingIndicator = false;
      }, 1000);
    },

    formatTime(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return "ตอนนี้";
      if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
      if (diffInMinutes < 1440)
        return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;

      return date.toLocaleDateString("th-TH", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    
    scrollToBottom() {
      if (this.$refs.chatBody)
        this.$refs.chatBody.scrollTop = this.$refs.chatBody.scrollHeight;
    },

    toggleP2P() {
      this.showChat = !this.showChat;
      if (this.showChat) {
        this.hasNewMessage = false;
        this.setChatMode("rooms");
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    initP2PFacade() {
      if (!this.currentUserId) return;

      if (this.onlineUsersUnsubscribe) this.onlineUsersUnsubscribe();
      console.log('initP2PFacade: subscribing to presence for', this.currentUserId);
      this.onlineUsersUnsubscribe = subscribeOnlineUsers((users) => {
        try { console.log('initP2PFacade: presence callback, total=', (users || []).length); } catch (_) { }
        this.onlineUsers = users.filter((u) => u.uid !== this.currentUserId);
        try { console.log('initP2PFacade: onlineUsers set to', this.onlineUsers.map(u => u.uid)); } catch (_) { }
      });

      if (this.chatRoomsUnsubscribe) this.chatRoomsUnsubscribe();
      this.chatRoomsUnsubscribe = subscribeP2PChatRooms(
        this.currentUserId,
        (rooms) => {
          this.chatRooms = rooms;
          this.unreadCount = rooms.reduce(
            (sum, r) => sum + (r.unreadCount || 0),
            0
          );
          this.hasNewMessage = this.unreadCount > 0;
        }
      );

      this.updateUserOnlineStatus();
      if (this.onlineStatusInterval) clearInterval(this.onlineStatusInterval);
      this.onlineStatusInterval = setInterval(
        () => this.updateUserOnlineStatus(),
        30000
      );
    },
    async updateUserOnlineStatus() {
      if (!this.currentUserId || !this.userProfile.name) return;
      try {
        await updateOnlineStatus(this.currentUserId, {
          name: this.userProfile.name,
          lastSeen: Date.now(),
        });
      } catch (e) {
        console.error("Failed to update online status:", e);
      }
    },
    setChatMode(mode) {
      this.chatMode = mode;
      if (mode === "rooms" && this.p2pChatUnsubscribe) {
        this.p2pChatUnsubscribe();
        this.p2pChatUnsubscribe = null;
      }
    },
    backToRooms() {
      this.setChatMode("rooms");
    },
    selectUserToChat(user) {
      this.selectedUser = user;
      this.chatMode = "chat";
      this.startRoomWith(user.uid);
    },
    selectChatRoom(room) {
      const other = this.onlineUsers.find((u) => u.uid === room.otherUid);
      if (other) {
        this.selectUserToChat(other);
      } else {
        this.selectedUser = {
          uid: room.otherUid,
          name: `User-${room.otherUid.slice(0, 6)}`,
        };
        this.chatMode = "chat";
        this.startRoomWith(room.otherUid);
      }
    },
    startRoomWith(otherUid) {
      if (this.p2pChatUnsubscribe) this.p2pChatUnsubscribe();

      this.p2pChatUnsubscribe = subscribeChat(
        this.currentUserId,
        otherUid,
        (messages) => {
          this.chatMessages = messages;
          this.$nextTick(() => this.scrollToBottom());
          markMessagesAsRead(this.currentUserId, otherUid);
        }
      );

      this.currentChatRoom = otherUid;
    },

    /**
     * Open chat UI and start a P2P session with another user by UID.
     * This is exposed to global scope so marker popups can call `window.openChatWith(uid, name)`.
     */
    openChatWith(otherUid, otherName = '') {
      try {
        if (!otherUid) return;
        if (!this.currentUserId) {
          alert('กรุณาเข้าสู่ระบบก่อนคุย');
          return;
        }

        this.showChat = true;
        this.chatMode = 'chat';
        // populate selectedUser for UI immediately
        this.selectedUser = {
          uid: otherUid,
          name: otherName || `User-${(otherUid || '').slice(0, 6)}`,
        };

        // start the P2P subscription and scroll to bottom
        this.$nextTick(() => {
          try {
            this.startRoomWith(otherUid);
            this.scrollToBottom();
          } catch (e) {
            console.error('openChatWith: startRoomWith failed', e);
          }
        });
      } catch (e) {
        console.error('openChatWith error:', e);
      }
    },

    
    }
}