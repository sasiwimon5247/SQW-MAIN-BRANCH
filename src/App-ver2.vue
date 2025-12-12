<template>
  <div id="app">
    <header class="app-header">
      <LoginBar />
      <RouterView v-if="false" />
    </header>
    <div v-if="showModeDisclaimerModal" class="mode-disclaimer-overlay">
        <ModeDisclaimerModal @close="showModeDisclaimerModal = false" />
    </div>
    <div v-if="!currentMode" class="mode-select fullscreen">
      <!-- เวลาเลือกโหมด จะ emit event 'select' ขึ้นมา → เรียก method selectMode ใน app-script2.js -->
      <ModeSelect @select="selectMode" />
    </div>
    <div v-else-if="currentMode === 'sale'">
      <nav class="navbar">
        <MapControls />
        <LandDashboard :dashboard="dashboard" />
        <ActionButtons />
        <div class="form-section">
          <LandInfoForm :landData="landData" @save="saveLandData" />
          <LandListPanel
            :savedLands="savedLands"
            @focus-land="focusLand"
            @delete-land="deleteLandItem"
          />
        </div>
      </nav>
    </div>
    <main class="main-content">
      <aside class="map-container">
        <div id="map" style="width: 100%; height: 100%"></div>
      </aside>
    </main>
    <section class="right-panel">
      <MapContainer />

      <SearchPanel
        :showSearch="showSearch"
        :searchQuery="searchQuery"
        @update:searchQuery="searchQuery = $event"
        @search="performSearch"
        @locate-gps="locateByGPS"
        @close="showSearch = false"
      />

      <FiltersPanel
        :showFilters="showFilters"
        :filters="filters"
        @apply="applyFilters"
        @reset="resetFilters"
        @close="showFilters = false"
      />

      <P2PChatPanel
        :showChat="showChat"
        :chatMode="chatMode"
        :messages="chatMessages"
        :chatRooms="chatRooms"
        :onlineUsers="onlineUsers"
        :selectedUser="selectedUser"
        :chatInput="chatInput"
        :tempUserName="tempUserName"
        :userProfile="userProfile"
        :unreadCount="unreadCount"
        @update:chatInput="chatInput = $event"
        @update:tempUserName="tempUserName = $event"
        @set-profile="setUserProfile"
        @select-user="selectUserToChat"
        @select-room="selectChatRoom"
        @back-to-rooms="backToRooms"
        @send="sendMessage"
        @close="showChat = false"
      />
    </section>
  </div>
</template>

<script src="./app-script2.js"></script>
<style>
   @import "styles/app.css";
   @import "styles/base.css";
   @import "styles/header.css";
   @import "styles/navbar.css";
   @import "styles/forms.css";
   @import "styles/buttons.css";
   @import "styles/controls.css";
   @import "styles/sections.css";
   @import "styles/map.css";
   @import "styles/panels.css";
   @import "styles/responsive.css";
   @import "styles/chat.css";
   @import "styles/main.css";
</style>