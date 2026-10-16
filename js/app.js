/**
 * BerkahBooth Main Application Controller
 * Integrates Camera, Audio, Filters, Multi-Layout Collage, Retake & Stickers
 */

import { CameraManager } from './camera.js';
import { soundEffects } from './audio.js';
import { FILTERS, getFilterById } from './filters.js';
import { TEMPLATES, FRAME_COLORS, FRAME_THEMES, renderCollage } from './templates.js';

// Application State
const state = {
  activeTemplateId: 'strip_4',
  activeFrameThemeId: 'sakura', // Default to Sakura Pastel Floral theme (bright & aesthetic)
  activeFrameColorId: 'white',
  activeFilterId: 'normal',
  countdownDelay: 3, // seconds
  photos: [], // array of Canvas elements or null for empty slots
  stickers: [], // array of { id, type, content, x, y, scale, rotation }
  frameTitle: 'BERKAH BOOTH',
  frameSubtext: 'SPECIAL MOMENTS ♡',
  isSessionRunning: false,
  retakingSlotIndex: null,
  activeCollageCanvas: null,
  isAudioMuted: false
};

// DOM Elements
const videoEl = document.getElementById('webcamVideo');
const toggleAudioBtn = document.getElementById('toggleAudioBtn');
const audioIcon = document.getElementById('audioIcon');
const toggleMirrorBtn = document.getElementById('toggleMirrorBtn');
const cameraSelect = document.getElementById('cameraSelect');
const resetSessionBtn = document.getElementById('resetSessionBtn');

const flashOverlay = document.getElementById('flashOverlay');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownNumber = document.getElementById('countdownNumber');
const countdownTip = document.getElementById('countdownTip');

const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const filterBadge = document.getElementById('filterBadge');
const sessionProgressBanner = document.getElementById('sessionProgressBanner');
const sessionProgressText = document.getElementById('sessionProgressText');
const retakeBanner = document.getElementById('retakeBanner');
const retakeBannerText = document.getElementById('retakeBannerText');
const cancelRetakeBtn = document.getElementById('cancelRetakeBtn');

const cameraFallbackNotice = document.getElementById('cameraFallbackNotice');
const retryCameraBtn = document.getElementById('retryCameraBtn');
const useSimulatorBtn = document.getElementById('useSimulatorBtn');

const manualSnapBtn = document.getElementById('manualSnapBtn');
const startSessionBtn = document.getElementById('startSessionBtn');
const startSessionBtnText = document.getElementById('startSessionBtnText');

const filterListContainer = document.getElementById('filterListContainer');
const slotsThumbnailsContainer = document.getElementById('slotsThumbnailsContainer');
const layoutChooser = document.getElementById('layoutChooser');
const frameThemeSelector = document.getElementById('frameThemeSelector');
const frameColorSection = document.getElementById('frameColorSection');
const frameColorPalette = document.getElementById('frameColorPalette');
const frameTitleInput = document.getElementById('frameTitleInput');
const frameSubtextInput = document.getElementById('frameSubtextInput');
const clearStickersBtn = document.getElementById('clearStickersBtn');
const collageContainer = document.getElementById('collageContainer');
const resolutionBadge = document.getElementById('resolutionBadge');

const downloadPngBtn = document.getElementById('downloadPngBtn');
const downloadJpgBtn = document.getElementById('downloadJpgBtn');
const printBtn = document.getElementById('printBtn');

// Single Photo Modal
const singlePhotoModal = document.getElementById('singlePhotoModal');
const singlePhotoPreviewImg = document.getElementById('singlePhotoPreviewImg');
const closeSingleModalBtn = document.getElementById('closeSingleModalBtn');
const addSingleToSlotBtn = document.getElementById('addSingleToSlotBtn');
const downloadSinglePhotoBtn = document.getElementById('downloadSinglePhotoBtn');
let lastSinglePhotoCanvas = null;

// Initialize Camera Manager
const cameraManager = new CameraManager(videoEl, { isMirrored: true });

/**
 * 1. Startup & Initialization
 */
async function initApp() {
  renderFrameThemeOptions();
  renderFilterOptions();
  renderFrameColorOptions();
  updateSlotsCount();
  setupEventListeners();

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Attempt camera connection
  await startCamera();
  await updateCollagePreview();
}

async function startCamera() {
  const result = await cameraManager.init();
  if (result.success) {
    cameraFallbackNotice.classList.add('hidden');
    statusText.textContent = "LIVE CAMERA";
    populateCameraDropdown();
  } else {
    // Show fallback notice with option to start simulator
    cameraFallbackNotice.classList.remove('hidden');
    statusText.textContent = "KAMERA NONAKTIF";
  }
}

async function populateCameraDropdown() {
  const devices = cameraManager.availableDevices;
  cameraSelect.innerHTML = '';
  if (devices.length === 0) {
    const opt = document.createElement('option');
    opt.value = "";
    opt.textContent = "Kamera Default";
    cameraSelect.appendChild(opt);
    return;
  }
  devices.forEach((dev, index) => {
    const opt = document.createElement('option');
    opt.value = dev.deviceId;
    opt.textContent = dev.label || `Kamera ${index + 1}`;
    cameraSelect.appendChild(opt);
  });
}

/**
 * Trigger Camera Screen Flash Animation
 */
function triggerFlash() {
  soundEffects.playShutter();
  flashOverlay.classList.remove('flash-active');
  void flashOverlay.offsetWidth; // Force reflow
  flashOverlay.classList.add('flash-active');
}

/**
 * 2. Visual Countdown Timer with Sound
 */
function runCountdown(seconds, tipMessage = "Siap-siap berpose! ✨") {
  return new Promise(resolve => {
    if (seconds <= 0) {
      resolve();
      return;
    }

    countdownOverlay.classList.remove('hidden');
    countdownTip.textContent = tipMessage;
    let current = seconds;

    const tick = () => {
      countdownNumber.textContent = current;
      countdownNumber.classList.remove('animate-countdown');
      void countdownNumber.offsetWidth; // Force reflow
      countdownNumber.classList.add('animate-countdown');

      if (current > 1) {
        soundEffects.playTick();
      } else {
        soundEffects.playReadyChime();
      }

      if (current <= 0) {
        countdownOverlay.classList.add('hidden');
        resolve();
      } else {
        current--;
        setTimeout(tick, 950);
      }
    };

    tick();
  });
}

/**
 * 3. Taking Photos (Single Snap & Sequential Session)
 */

// Capture a photo with active filter applied
function captureCurrentPose() {
  triggerFlash();
  const rawCanvas = cameraManager.captureFrame(1200, 900);
  return rawCanvas;
}

// Single Manual Snapshot (Fase 1)
async function handleSingleSnap() {
  if (state.isSessionRunning) return;

  if (state.countdownDelay > 0) {
    await runCountdown(state.countdownDelay, "Foto Tunggal... Senyum! 😊");
  }

  const rawCanvas = captureCurrentPose();

  // Create a filtered copy for single photo view & download
  const filteredSingleCanvas = document.createElement('canvas');
  filteredSingleCanvas.width = rawCanvas.width;
  filteredSingleCanvas.height = rawCanvas.height;
  const sctx = filteredSingleCanvas.getContext('2d');
  if (state.activeFilterId && state.activeFilterId !== 'normal') {
    const { applyFilterToCanvas } = await import('./filters.js');
    applyFilterToCanvas(sctx, state.activeFilterId);
  }
  sctx.drawImage(rawCanvas, 0, 0);

  lastSinglePhotoCanvas = filteredSingleCanvas;

  // Show in single photo modal
  singlePhotoPreviewImg.src = filteredSingleCanvas.toDataURL('image/png');
  singlePhotoModal.classList.remove('hidden');

  // If currently in retake mode, assign it immediately
  if (state.retakingSlotIndex !== null) {
    state.photos[state.retakingSlotIndex] = rawCanvas;
    endRetakeMode();
    renderSlotsThumbnails();
    await updateCollagePreview();
  }
}

// Multi-Pose Automatic Session (Fase 2 & 3)
async function handleStartSession() {
  if (state.isSessionRunning) return;
  
  // If in retake mode, just shoot this one slot
  if (state.retakingSlotIndex !== null) {
    const targetSlot = state.retakingSlotIndex;
    if (state.countdownDelay > 0) {
      await runCountdown(state.countdownDelay, `Retake Pose #${targetSlot + 1}! ✨`);
    }
    const photo = captureCurrentPose();
    state.photos[targetSlot] = photo;
    endRetakeMode();
    renderSlotsThumbnails();
    await updateCollagePreview();
    return;
  }

  const template = TEMPLATES[state.activeTemplateId];
  const totalSlots = template.slotsCount;

  state.isSessionRunning = true;
  startSessionBtn.disabled = true;
  manualSnapBtn.disabled = true;
  sessionProgressBanner.classList.remove('hidden');

  state.photos = [];
  renderSlotsThumbnails();

  for (let i = 0; i < totalSlots; i++) {
    sessionProgressText.textContent = `POSE ${i + 1} DARI ${totalSlots}`;
    
    // Countdown
    const countdownSecs = state.countdownDelay > 0 ? state.countdownDelay : 2;
    await runCountdown(countdownSecs, `Pose ${i + 1} dari ${totalSlots}: Senyum! 📸`);

    // Capture
    const photo = captureCurrentPose();
    state.photos.push(photo);
    renderSlotsThumbnails();
    await updateCollagePreview();

    // Small delay between shots if not last
    if (i < totalSlots - 1) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  sessionProgressBanner.classList.add('hidden');
  state.isSessionRunning = false;
  startSessionBtn.disabled = false;
  manualSnapBtn.disabled = false;
  soundEffects.playPop();
}

/**
 * 4. Retake Individual Pose Slot
 */
function startRetakeSlot(slotIndex) {
  state.retakingSlotIndex = slotIndex;
  retakeBanner.classList.remove('hidden');
  retakeBannerText.textContent = `Mengulang Pose #${slotIndex + 1}`;
  startSessionBtnText.textContent = `Jepret Ulang Pose #${slotIndex + 1}`;
  soundEffects.playPop();

  // Scroll to camera view if mobile
  videoEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function endRetakeMode() {
  state.retakingSlotIndex = null;
  retakeBanner.classList.add('hidden');
  const count = TEMPLATES[state.activeTemplateId].slotsCount;
  startSessionBtnText.textContent = `Mulai Sesi Otomatis (${count} Pose)`;
}

/**
 * 5. Update and Render Collage
 */
async function updateCollagePreview() {
  const template = TEMPLATES[state.activeTemplateId];
  resolutionBadge.textContent = `${template.width} x ${template.height} px`;

  const canvas = await renderCollage({
    templateId: state.activeTemplateId,
    frameThemeId: state.activeFrameThemeId,
    frameColorId: state.activeFrameColorId,
    photos: state.photos,
    filterId: state.activeFilterId,
    titleText: state.frameTitle,
    subText: state.frameSubtext,
    stickers: state.stickers,
    scale: 1.0
  });

  state.activeCollageCanvas = canvas;
  collageContainer.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = "relative inline-block";

  canvas.className = "block w-auto h-auto max-h-[420px] object-contain rounded-lg shadow-2xl";
  wrapper.appendChild(canvas);

  const overlay = document.createElement('div');
  overlay.className = "absolute inset-0 pointer-events-none";
  overlay.id = "stickerOverlayLayer";
  wrapper.appendChild(overlay);

  collageContainer.appendChild(wrapper);

  // Setup interactive sticker overlay container over canvas
  setupStickerOverlay(overlay);
}

/**
 * 6. Interactive Sticker Overlay & Dragging
 */
function setupStickerOverlay(overlay) {
  state.stickers.forEach((sticker) => {
    const el = document.createElement('div');
    el.className = "sticker-item pointer-events-auto text-3xl select-none cursor-move group";
    el.style.left = `${sticker.x * 100}%`;
    el.style.top = `${sticker.y * 100}%`;
    el.style.transform = `translate(-50%, -50%) scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`;
    el.title = "Geser stiker, atau klik dua kali / tombol ✕ untuk hapus";

    el.innerHTML = `
      <span class="relative inline-block">
        ${sticker.content}
        <button class="delete-sticker-btn hidden group-hover:flex absolute -top-2.5 -right-2.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] items-center justify-center cursor-pointer shadow hover:scale-110 transition">✕</button>
      </span>
    `;

    // Delete single sticker
    const delBtn = el.querySelector('.delete-sticker-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.stickers = state.stickers.filter(s => s.id !== sticker.id);
        soundEffects.playPop();
        updateCollagePreview();
      });
    }

    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      state.stickers = state.stickers.filter(s => s.id !== sticker.id);
      soundEffects.playPop();
      updateCollagePreview();
    });

    // Drag handling
    let isDragging = false;
    let startX, startY;

    const onPointerDown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      isDragging = true;
      el.classList.add('selected');
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX = clientX;
      startY = clientY;

      const onPointerMove = (moveEvt) => {
        if (!isDragging) return;
        const currentX = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
        const currentY = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;

        const rect = overlay.getBoundingClientRect();
        const newX = Math.max(0.05, Math.min(0.95, (currentX - rect.left) / rect.width));
        const newY = Math.max(0.05, Math.min(0.95, (currentY - rect.top) / rect.height));

        sticker.x = newX;
        sticker.y = newY;
        el.style.left = `${newX * 100}%`;
        el.style.top = `${newY * 100}%`;
      };

      const onPointerUp = async () => {
        if (isDragging) {
          isDragging = false;
          el.classList.remove('selected');
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('touchmove', onPointerMove);
          window.removeEventListener('touchend', onPointerUp);
          await updateCollagePreview();
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
    };

    el.addEventListener('pointerdown', onPointerDown);
    overlay.appendChild(el);
  });
}

function addSticker(emoji) {
  soundEffects.playPop();
  state.stickers.push({
    id: Date.now() + Math.random(),
    type: 'emoji',
    content: emoji,
    x: 0.5 + (Math.random() * 0.2 - 0.1),
    y: 0.4 + (Math.random() * 0.2 - 0.1),
    scale: 1.0,
    rotation: (Math.random() * 20 - 10)
  });
  updateCollagePreview();
}

/**
 * 7. UI Rendering Helpers
 */
function renderFrameThemeOptions() {
  if (!frameThemeSelector) return;
  frameThemeSelector.innerHTML = '';

  FRAME_THEMES.forEach(t => {
    const btn = document.createElement('button');
    const isActive = state.activeFrameThemeId === t.id;
    btn.className = `p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
      isActive
        ? 'border-indigo-600 bg-indigo-50/90 shadow-md ring-1 ring-indigo-500/30'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs'
    }`;

    btn.innerHTML = `
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-lg">${t.icon}</span>
        <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
          isActive ? 'bg-indigo-600 text-white font-black' : 'bg-slate-100 text-slate-600 border border-slate-200'
        }">${t.badge}</span>
      </div>
      <div>
        <span class="block text-xs font-bold ${isActive ? 'text-indigo-950' : 'text-slate-800'} leading-tight">${t.name}</span>
        <span class="block text-[10px] text-slate-500 line-clamp-1 mt-0.5">${t.tagline}</span>
      </div>
    `;

    btn.addEventListener('click', () => {
      soundEffects.playPop();
      state.activeFrameThemeId = t.id;

      // Update frame color section visibility (classic solid theme utilizes color palette)
      if (frameColorSection) {
        if (t.id === 'classic') {
          frameColorSection.classList.remove('opacity-40', 'pointer-events-none');
        } else {
          frameColorSection.classList.add('opacity-40');
        }
      }

      renderFrameThemeOptions();
      updateCollagePreview();
    });

    frameThemeSelector.appendChild(btn);
  });
}

function renderFilterOptions() {
  filterListContainer.innerHTML = '';
  FILTERS.forEach(f => {
    const btn = document.createElement('button');
    btn.className = `flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
      state.activeFilterId === f.id
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-1 ring-indigo-400/30'
        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 shadow-xs'
    }`;
    btn.innerHTML = `<span>${f.icon}</span> <span>${f.name}</span>`;
    btn.addEventListener('click', () => {
      soundEffects.playPop();
      state.activeFilterId = f.id;
      // Apply CSS filter directly to video for instant real-time feedback
      videoEl.style.filter = f.cssFilter;
      filterBadge.textContent = `Filter: ${f.name}`;
      renderFilterOptions();
      updateCollagePreview();
    });
    filterListContainer.appendChild(btn);
  });
}

function renderFrameColorOptions() {
  frameColorPalette.innerHTML = '';
  FRAME_COLORS.forEach(c => {
    const btn = document.createElement('button');
    const isActive = state.activeFrameColorId === c.id;
    btn.className = `w-8 h-8 rounded-full border-2 transition-transform ${
      isActive ? 'border-indigo-600 scale-110 shadow-md shadow-indigo-500/25 ring-2 ring-indigo-300' : 'border-slate-300 hover:scale-105'
    }`;
    btn.style.backgroundColor = c.bg;
    btn.title = c.name;
    btn.addEventListener('click', () => {
      soundEffects.playPop();
      state.activeFrameColorId = c.id;
      renderFrameColorOptions();
      updateCollagePreview();
    });
    frameColorPalette.appendChild(btn);
  });
}

function updateSlotsCount() {
  const template = TEMPLATES[state.activeTemplateId];
  const count = template.slotsCount;
  startSessionBtnText.textContent = `Mulai Sesi Otomatis (${count} Pose)`;

  // Trim or adjust state.photos array if template changed
  if (state.photos.length > count) {
    state.photos = state.photos.slice(0, count);
  }
  renderSlotsThumbnails();
}

function renderSlotsThumbnails() {
  const template = TEMPLATES[state.activeTemplateId];
  const count = template.slotsCount;
  slotsThumbnailsContainer.innerHTML = '';
  slotsThumbnailsContainer.className = `grid gap-2.5 ${count === 1 ? 'grid-cols-1 max-w-[140px]' : count === 3 ? 'grid-cols-3' : 'grid-cols-4'}`;

  for (let i = 0; i < count; i++) {
    const photo = state.photos[i];
    const isRetaking = state.retakingSlotIndex === i;

    const card = document.createElement('div');
    card.className = `relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-50 border transition ${
      isRetaking
        ? 'border-amber-500 ring-2 ring-amber-400/50'
        : photo
        ? 'border-indigo-500 shadow-xs'
        : 'border-slate-300 border-dashed'
    }`;

    if (photo) {
      const img = document.createElement('img');
      img.src = photo.toDataURL('image/jpeg', 0.7);
      img.className = "w-full h-full object-cover";
      card.appendChild(img);

      // Retake Overlay Button
      const retakeBtn = document.createElement('button');
      retakeBtn.className = "absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-amber-300";
      retakeBtn.innerHTML = `<span>🔄</span><span>Retake</span>`;
      retakeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startRetakeSlot(i);
      });
      card.appendChild(retakeBtn);
    } else {
      const emptyLabel = document.createElement('div');
      emptyLabel.className = "w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1";
      emptyLabel.innerHTML = `<span>#${i + 1}</span><span class="text-[9px] text-slate-400">Kosong</span>`;
      card.appendChild(emptyLabel);
    }

    slotsThumbnailsContainer.appendChild(card);
  }
}

/**
 * 8. Download & Print Functions
 */
async function downloadFinalCollage(format = 'image/png', filename = 'berkahbooth_collage') {
  if (!state.activeCollageCanvas) return;

  // Render high-res 2x version for sharp printing
  const highResCanvas = await renderCollage({
    templateId: state.activeTemplateId,
    frameThemeId: state.activeFrameThemeId,
    frameColorId: state.activeFrameColorId,
    photos: state.photos,
    filterId: state.activeFilterId,
    titleText: state.frameTitle,
    subText: state.frameSubtext,
    stickers: state.stickers,
    scale: 2.0 // Sharp 2x resolution
  });

  const ext = format === 'image/jpeg' ? 'jpg' : 'png';
  const dataUrl = highResCanvas.toDataURL(format, 0.95);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}_${Date.now()}.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  soundEffects.playPop();
}

/**
 * 9. Event Listeners Setup
 */
function setupEventListeners() {
  // Audio toggle
  toggleAudioBtn.addEventListener('click', () => {
    state.isAudioMuted = soundEffects.toggleMute();
    if (state.isAudioMuted) {
      audioIcon.setAttribute('data-lucide', 'volume-x');
      audioIcon.className = "w-4 h-4 text-rose-400";
    } else {
      audioIcon.setAttribute('data-lucide', 'volume-2');
      audioIcon.className = "w-4 h-4 text-emerald-400";
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // Mirror toggle
  toggleMirrorBtn.addEventListener('click', () => {
    soundEffects.playPop();
    cameraManager.toggleMirror();
  });

  // Camera switcher
  cameraSelect.addEventListener('change', async (e) => {
    if (e.target.value) {
      try {
        await cameraManager.startStream(e.target.value);
      } catch (err) {
        console.error("Camera switch error:", err);
      }
    }
  });

  // Camera permissions & simulator buttons
  retryCameraBtn.addEventListener('click', () => startCamera());
  useSimulatorBtn.addEventListener('click', () => {
    cameraManager.startMockCamera();
    cameraFallbackNotice.classList.add('hidden');
    statusText.textContent = "SIMULASI KAMERA";
    statusBadge.className = "flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-semibold shadow-xs";
  });

  // Timer delay buttons
  document.querySelectorAll('.timer-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundEffects.playPop();
      document.querySelectorAll('.timer-opt-btn').forEach(b => {
        b.classList.remove('active', 'bg-indigo-600', 'text-white', 'shadow-sm');
        b.classList.add('text-slate-600');
      });
      btn.classList.add('active', 'bg-indigo-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-600');
      state.countdownDelay = parseInt(btn.dataset.delay, 10);
    });
  });

  // Single manual snap button (Fase 1)
  manualSnapBtn.addEventListener('click', handleSingleSnap);

  // Multi-pose automatic session button (Fase 2 & 3)
  startSessionBtn.addEventListener('click', handleStartSession);

  // Cancel retake
  cancelRetakeBtn.addEventListener('click', endRetakeMode);

  // Reset Session
  resetSessionBtn.addEventListener('click', () => {
    if (confirm("Mulai ulang seluruh sesi foto?")) {
      state.photos = [];
      state.stickers = [];
      endRetakeMode();
      renderSlotsThumbnails();
      updateCollagePreview();
    }
  });

  // Layout template switcher
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundEffects.playPop();
      document.querySelectorAll('.layout-btn').forEach(b => {
        b.classList.remove('active', 'border-indigo-500', 'bg-indigo-50/90', 'ring-1', 'ring-indigo-400/20');
        b.classList.add('border-slate-200', 'bg-white');
      });
      btn.classList.add('active', 'border-indigo-500', 'bg-indigo-50/90', 'ring-1', 'ring-indigo-400/20');
      btn.classList.remove('border-slate-200', 'bg-white');
      state.activeTemplateId = btn.dataset.template;
      updateSlotsCount();
      updateCollagePreview();
    });
  });

  // Text inputs
  frameTitleInput.addEventListener('input', (e) => {
    state.frameTitle = e.target.value;
    updateCollagePreview();
  });
  frameSubtextInput.addEventListener('input', (e) => {
    state.frameSubtext = e.target.value;
    updateCollagePreview();
  });

  // Sticker pickers
  document.querySelectorAll('.sticker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addSticker(btn.dataset.emoji);
    });
  });

  clearStickersBtn.addEventListener('click', () => {
    soundEffects.playPop();
    state.stickers = [];
    updateCollagePreview();
  });

  // Download actions
  downloadPngBtn.addEventListener('click', () => downloadFinalCollage('image/png', 'berkahbooth_hd'));
  downloadJpgBtn.addEventListener('click', () => downloadFinalCollage('image/jpeg', 'berkahbooth_hq'));
  printBtn.addEventListener('click', async () => {
    if (!state.activeCollageCanvas) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Mohon izinkan pop-up jendela untuk fitur cetak!");
      return;
    }
    const dataUrl = state.activeCollageCanvas.toDataURL('image/png');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak BerkahBooth</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { max-height: 96vh; max-width: 96vw; object-contain: contain; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${dataUrl}" />
        </body>
      </html>
    `);
    printWindow.document.close();
  });

  // Single modal buttons
  closeSingleModalBtn.addEventListener('click', () => {
    singlePhotoModal.classList.add('hidden');
  });
  addSingleToSlotBtn.addEventListener('click', () => {
    if (lastSinglePhotoCanvas) {
      // Find first empty slot or push
      const maxSlots = TEMPLATES[state.activeTemplateId].slotsCount;
      if (state.photos.length < maxSlots) {
        state.photos.push(lastSinglePhotoCanvas);
      } else {
        state.photos[maxSlots - 1] = lastSinglePhotoCanvas;
      }
      renderSlotsThumbnails();
      updateCollagePreview();
      singlePhotoModal.classList.add('hidden');
      soundEffects.playPop();
    }
  });
  downloadSinglePhotoBtn.addEventListener('click', () => {
    if (lastSinglePhotoCanvas) {
      const link = document.createElement('a');
      link.href = lastSinglePhotoCanvas.toDataURL('image/png');
      link.download = `berkahbooth_single_${Date.now()}.png`;
      link.click();
    }
  });
}

// Kickstart on DOM Ready or immediately if already loaded
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
