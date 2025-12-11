<template>
  <div id="app">
    <header class="app-header">
      <LoginBar />
      <RouterView v-if="false" />
    </header>
    <div v-if="showModeDisclaimerModal" class="mode-disclaimer-overlay">
        <ModeDisclaimerModal />
    </div>
    <div v-if="!currentMode" class="mode-select fullscreen">
        <ModeSelect />
    </div>
    <div v-else-if="currentMode === 'sale'">
      <nav class="navbar">
        <MapControls />
        <LandDashboard />
        <ActionButtons />
        <div class="form-section">
            <LandInfoForm />
            <LandListPanel />
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
        <SearchPanel />
        <FiltersPanel />
        <P2PChatPanel />
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