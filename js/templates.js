/**
 * BerkahBooth Template & Canvas Collage Renderer
 * Supports rich themed frames (Penjara, Perpustakaan, Film 35mm, Koran Jadul, Y2K, Sakura, Scrapbook, Minimalis)
 * and multi-layout rendering with high-res export
 */
import { applyFilterToCanvas } from './filters.js';

export const TEMPLATES = {
  strip_4: {
    id: 'strip_4',
    name: '4-Cut Korean Strip',
    description: 'Strip vertikal 4 foto klasik ala photo booth Korea',
    slotsCount: 4,
    width: 600,
    height: 1800,
    aspectRatio: '1 / 3',
    getSlots: (w, h, themeMargin = 0) => {
      const padding = 28 + themeMargin;
      const gap = 20;
      const headerSpace = 38;
      const footerSpace = 180;
      const photoWidth = w - padding * 2;
      const totalAvailableH = h - headerSpace - footerSpace - padding * 2 - gap * 3;
      const photoHeight = totalAvailableH / 4;

      const slots = [];
      for (let i = 0; i < 4; i++) {
        slots.push({
          x: padding,
          y: headerSpace + padding + i * (photoHeight + gap),
          width: photoWidth,
          height: photoHeight
        });
      }
      return {
        slots,
        footerRect: {
          x: padding,
          y: h - footerSpace - 10,
          width: photoWidth,
          height: footerSpace
        }
      };
    }
  },

  strip_3: {
    id: 'strip_3',
    name: '3-Cut Classic Strip',
    description: 'Strip vertikal 3 foto elegan & ringkas',
    slotsCount: 3,
    width: 600,
    height: 1400,
    aspectRatio: '3 / 7',
    getSlots: (w, h, themeMargin = 0) => {
      const padding = 28 + themeMargin;
      const gap = 20;
      const headerSpace = 34;
      const footerSpace = 160;
      const photoWidth = w - padding * 2;
      const totalAvailableH = h - headerSpace - footerSpace - padding * 2 - gap * 2;
      const photoHeight = totalAvailableH / 3;

      const slots = [];
      for (let i = 0; i < 3; i++) {
        slots.push({
          x: padding,
          y: headerSpace + padding + i * (photoHeight + gap),
          width: photoWidth,
          height: photoHeight
        });
      }
      return {
        slots,
        footerRect: {
          x: padding,
          y: h - footerSpace - 10,
          width: photoWidth,
          height: footerSpace
        }
      };
    }
  },

  grid_2x2: {
    id: 'grid_2x2',
    name: 'Modern 2x2 Grid',
    description: 'Susunan 4 kotak modern ala studio estetik',
    slotsCount: 4,
    width: 1000,
    height: 1250,
    aspectRatio: '4 / 5',
    getSlots: (w, h, themeMargin = 0) => {
      const padding = 40 + themeMargin;
      const gap = 24;
      const headerSpace = 34;
      const footerSpace = 180;

      const photoWidth = (w - padding * 2 - gap) / 2;
      const totalAvailableH = h - headerSpace - footerSpace - padding * 2 - gap;
      const photoHeight = totalAvailableH / 2;

      const slots = [
        { x: padding, y: headerSpace + padding, width: photoWidth, height: photoHeight },
        { x: padding + photoWidth + gap, y: headerSpace + padding, width: photoWidth, height: photoHeight },
        { x: padding, y: headerSpace + padding + photoHeight + gap, width: photoWidth, height: photoHeight },
        { x: padding + photoWidth + gap, y: headerSpace + padding + photoHeight + gap, width: photoWidth, height: photoHeight }
      ];

      return {
        slots,
        footerRect: {
          x: padding,
          y: h - footerSpace - 10,
          width: w - padding * 2,
          height: footerSpace
        }
      };
    }
  },

  single_polaroid: {
    id: 'single_polaroid',
    name: 'Single Aesthetic Polaroid',
    description: '1 foto besar dengan bingkai polaroid klasik',
    slotsCount: 1,
    width: 900,
    height: 1150,
    aspectRatio: '9 / 11.5',
    getSlots: (w, h, themeMargin = 0) => {
      const padding = 50 + themeMargin;
      const footerSpace = 220;
      const photoWidth = w - padding * 2;
      const photoHeight = h - padding - footerSpace;

      return {
        slots: [{ x: padding, y: padding, width: photoWidth, height: photoHeight }],
        footerRect: {
          x: padding,
          y: h - footerSpace + 20,
          width: photoWidth,
          height: footerSpace - 40
        }
      };
    }
  }
};

export const FRAME_COLORS = [
  { id: 'white', name: 'Studio White', bg: '#ffffff', text: '#0f172a', subtext: '#64748b', border: '#e2e8f0' },
  { id: 'black', name: 'Midnight Noir', bg: '#111827', text: '#f8fafc', subtext: '#94a3b8', border: '#1f2937' },
  { id: 'pink', name: 'Pastel Blossom', bg: '#fce7f3', text: '#831843', subtext: '#be185d', border: '#fbcfe8' },
  { id: 'blue', name: 'Baby Cloud', bg: '#e0f2fe', text: '#0369a1', subtext: '#0284c7', border: '#bae6fd' },
  { id: 'butter', name: 'Vintage Cream', bg: '#fef3c7', text: '#78350f', subtext: '#92400e', border: '#fde68a' },
  { id: 'matcha', name: 'Matcha Sage', bg: '#dcfce7', text: '#14532d', subtext: '#166534', border: '#bbf7d0' },
  { id: 'lavender', name: 'Soft Lilac', bg: '#ede9fe', text: '#4c1d95', subtext: '#6d28d9', border: '#ddd6fe' }
];

export function getFrameColor(id) {
  return FRAME_COLORS.find(c => c.id === id) || FRAME_COLORS[0];
}

/**
 * Rich Frame Themes Configuration
 */
export const FRAME_THEMES = [
  {
    id: 'prison',
    name: 'Penjara / Mugshot',
    icon: '🚨',
    badge: 'Popular',
    tagline: 'Police Dept, ruler tinggi badan & booking ID'
  },
  {
    id: 'library',
    name: 'Perpustakaan Vintage',
    icon: '📚',
    badge: 'Classic',
    tagline: 'Kertas antik, cap buku pinjaman & ornamen emas'
  },
  {
    id: 'film35',
    name: 'Film 35mm Negatif',
    icon: '🎞️',
    badge: 'Retro',
    tagline: 'Lubang gerigi film roll & kode Kodak Portra'
  },
  {
    id: 'newspaper',
    name: 'Koran Jadul (Gazette)',
    icon: '📰',
    badge: 'Vintage',
    tagline: 'Koran berita utama The Daily Chronicles'
  },
  {
    id: 'y2k',
    name: 'Y2K Cyber Arcade',
    icon: '👾',
    badge: 'Aesthetic',
    tagline: 'Bintang cyber, neon glow & retro windows'
  },
  {
    id: 'sakura',
    name: 'Sakura Pastel Floral',
    icon: '🌸',
    badge: 'Cute',
    tagline: 'Bunga sakura, kelopak lembut & aksen Korea'
  },
  {
    id: 'scrapbook',
    name: 'Washi Tape Scrapbook',
    icon: '📎',
    badge: 'Artistic',
    tagline: 'Plester washi tape warna-warni di sudut foto'
  },
  {
    id: 'classic',
    name: 'Minimalis Studio',
    icon: '🏢',
    badge: 'Clean',
    tagline: 'Desain bersih solid dengan pilihan palet warna'
  }
];

export function getFrameTheme(id) {
  return FRAME_THEMES.find(t => t.id === id) || FRAME_THEMES[0];
}

/**
 * Helper to draw rounded rectangle
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Helper to draw diagonal caution stripes
 */
function drawCautionStripe(ctx, x, y, width, height) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  ctx.fillStyle = '#eab308';
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = '#0f172a';
  const stripeWidth = 20;
  for (let i = -height; i < width + height; i += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + stripeWidth, y);
    ctx.lineTo(x + i + stripeWidth - height, y + height);
    ctx.lineTo(x + i - height, y + height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Helper to draw realistic washi tape
 */
function drawWashiTape(ctx, x, y, width, height, angleDeg, color = 'rgba(251, 191, 36, 0.75)') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angleDeg * Math.PI) / 180);

  // Soft shadow
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  // Tape body
  ctx.fillStyle = color;
  ctx.fillRect(-width / 2, -height / 2, width, height);

  // Serrated edges
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(-width / 2 + 2, -height / 2 + 2, width - 4, height - 4);

  // Subtle tape pattern
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = -width / 2 + 8; i < width / 2 - 8; i += 14) {
    ctx.fillRect(i, -height / 2 + 3, 4, height - 6);
  }

  ctx.restore();
}

/**
 * RENDER THEME 1: Penjara / Mugshot Police Dept
 */
function renderPrisonTheme(ctx, template, slots, footerRect, options) {
  const w = template.width;
  const h = template.height;

  // 1. Concrete / Slate Police Line Wall Background
  const wallGrad = ctx.createLinearGradient(0, 0, w, h);
  wallGrad.addColorStop(0, '#1c222c');
  wallGrad.addColorStop(1, '#0f131a');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle vertical prison bars texture in background
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 12;
  for (let bx = 30; bx < w; bx += 40) {
    ctx.beginPath();
    ctx.moveTo(bx, 0);
    ctx.lineTo(bx, h);
    ctx.stroke();
  }

  // 2. Height Measurement Ruler Lines on Left and Right borders
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 11px monospace';
  ctx.lineWidth = 1.5;

  const heightLabels = ["6'2\"", "6'0\"", "5'10\"", "5'8\"", "5'6\"", "5'4\"", "5'2\"", "5'0\"", "4'10\""];
  const startY = 80;
  const endY = h - 220;
  const stepY = (endY - startY) / (heightLabels.length - 1);

  heightLabels.forEach((label, idx) => {
    const curY = startY + idx * stepY;
    // Left tick
    ctx.beginPath();
    ctx.moveTo(4, curY);
    ctx.lineTo(24, curY);
    ctx.stroke();
    ctx.fillText(label, 26, curY + 4);

    // Right tick
    ctx.beginPath();
    ctx.moveTo(w - 24, curY);
    ctx.lineTo(w - 4, curY);
    ctx.stroke();

    // Intermediate micro ticks
    if (idx < heightLabels.length - 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(4, curY + stepY / 2);
      ctx.lineTo(16, curY + stepY / 2);
      ctx.moveTo(w - 16, curY + stepY / 2);
      ctx.lineTo(w - 4, curY + stepY / 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    }
  });

  // 3. Top Caution Tape Banner
  drawCautionStripe(ctx, 0, 0, w, 18);

  // 4. Header: Police Department
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText("POLICE DEPARTMENT • INMATE BOOKING", w / 2, 42);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 10px monospace';
  ctx.fillText("DIVISION OF CRIMINAL IDENTIFICATION", w / 2, 56);
  ctx.restore();

  // 5. Draw Photo Slots with Riveted Metal Borders
  slots.forEach((slot, index) => {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 8);
    ctx.stroke();

    // Corner crosshairs on each photo slot
    const chSize = 14;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    // Top-left cross
    ctx.beginPath();
    ctx.moveTo(slot.x - 2, slot.y + chSize);
    ctx.lineTo(slot.x - 2, slot.y - 2);
    ctx.lineTo(slot.x + chSize, slot.y - 2);
    ctx.stroke();
    // Bottom-right cross
    ctx.beginPath();
    ctx.moveTo(slot.x + slot.width + 2, slot.y + slot.height - chSize);
    ctx.lineTo(slot.x + slot.width + 2, slot.y + slot.height + 2);
    ctx.lineTo(slot.x + slot.width - chSize, slot.y + slot.height + 2);
    ctx.stroke();

    // Small slot label
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`MUGSHOT #${index + 1}`, slot.x + 8, slot.y + 14);
  });

  // 6. Bottom Mugshot Booking Placard Board
  ctx.save();
  const fX = footerRect.x;
  const fY = footerRect.y;
  const fW = footerRect.width;
  const fH = footerRect.height;

  // Placard background
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(fX, fY, fW, fH);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  ctx.strokeRect(fX, fY, fW, fH);

  // Top caution stripe on placard
  drawCautionStripe(ctx, fX, fY, fW, 12);

  const centerX = fX + fW / 2;
  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px "Outfit", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText((options.titleText || 'BERKAH PRISON').toUpperCase(), centerX, fY + 44);

  // Red Stamp: CONFIDENTIAL / GUILTY
  ctx.save();
  ctx.translate(fX + fW - 75, fY + 48);
  ctx.rotate(-0.16);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-45, -14, 90, 28);
  ctx.fillStyle = '#ef4444';
  ctx.font = '900 13px monospace';
  ctx.fillText("WANTED", 0, 5);
  ctx.restore();

  // Booking details & subtitle
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 13px monospace';
  ctx.fillText(options.subText || 'CRIME: TERLALU KECE ♡', centerX, fY + 76);

  // Dynamic Case ID & Date
  const now = new Date();
  const dateStr = options.dateText || `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  ctx.font = '500 11px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`ID: #BK-${now.getFullYear()}-9402 • DATE: ${dateStr}`, centerX, fY + 102);

  // Barcode
  ctx.fillStyle = '#f8fafc';
  const bcWidth = 180;
  const bcX = centerX - bcWidth / 2;
  const bcY = fY + 118;
  const barHeights = 24;
  for (let i = 0; i < bcWidth; i += 4) {
    const isThick = ((i * 7 + 13) % 9) > 4;
    ctx.fillRect(bcX + i, bcY, isThick ? 2.5 : 1.2, barHeights);
  }
  ctx.font = '9px monospace';
  ctx.fillText("* 8 9 2 4 1 0 7 6 5 3 *", centerX, fY + 154);

  ctx.restore();
}

/**
 * RENDER THEME 2: Perpustakaan Vintage (Dark Academia)
 */
function renderLibraryTheme(ctx, template, slots, footerRect, options) {
  const w = template.width;
  const h = template.height;

  // 1. Aged Parchment / Antique Book Paper Background
  const paperGrad = ctx.createLinearGradient(0, 0, w, h);
  paperGrad.addColorStop(0, '#f5ecd7');
  paperGrad.addColorStop(0.5, '#ede1c4');
  paperGrad.addColorStop(1, '#dfceaa');
  ctx.fillStyle = paperGrad;
  ctx.fillRect(0, 0, w, h);

  // Outer ornate bookish border lines
  ctx.strokeStyle = '#5a3825';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  ctx.strokeStyle = '#8c5e3c';
  ctx.lineWidth = 1;
  ctx.strokeRect(14, 14, w - 28, h - 28);

  // Victorian filigree corner brackets
  const drawCornerFlourish = (cx, cy, flipX, flipY) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, flipY);
    ctx.strokeStyle = '#5a3825';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI / 2);
    ctx.arc(0, 0, 16, 0, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = '#5a3825';
    ctx.fillRect(20, -2, 4, 4);
    ctx.fillRect(-2, 20, 4, 4);
    ctx.restore();
  };
  drawCornerFlourish(20, 20, 1, 1);
  drawCornerFlourish(w - 20, 20, -1, 1);
  drawCornerFlourish(20, h - 20, 1, -1);
  drawCornerFlourish(w - 20, h - 20, -1, -1);

  // Header: Library classification
  ctx.save();
  ctx.fillStyle = '#452a1a';
  ctx.textAlign = 'center';
  ctx.font = 'italic 700 16px "Playfair Display", Georgia, serif';
  ctx.fillText("Archives & Rare Book Library", w / 2, 38);

  ctx.font = '500 10px monospace';
  ctx.fillStyle = '#7a5138';
  ctx.letterSpacing = '1.5px';
  ctx.fillText("CLASSIFICATION: PERMANENT ARCHIVE • DEWEY 823.914", w / 2, 54);
  ctx.restore();

  // Photo slots with sepia border & gold accents
  slots.forEach((slot, i) => {
    ctx.strokeStyle = '#5a3825';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 6);
    ctx.stroke();

    // Subtle inner golden border
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, slot.x - 3, slot.y - 3, slot.width + 6, slot.height + 6, 8);
    ctx.stroke();

    // Roman numeral tag
    const roman = ["I", "II", "III", "IV"][i] || `${i + 1}`;
    ctx.fillStyle = '#5a3825';
    ctx.font = 'bold 11px "Playfair Display", serif';
    ctx.fillText(`VOL. ${roman}`, slot.x + 8, slot.y + 16);
  });

  // Footer: Library Card "DATE DUE" Stamp & Title
  ctx.save();
  const fCenterX = footerRect.x + footerRect.width / 2;
  const fY = footerRect.y;

  // Stamped Date Due Box
  ctx.save();
  ctx.translate(fCenterX, fY + 45);
  ctx.rotate(-0.04);
  ctx.strokeStyle = '#8a2b2b';
  ctx.lineWidth = 2;
  ctx.strokeRect(-90, -18, 180, 36);

  ctx.fillStyle = '#8a2b2b';
  ctx.font = '900 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText("DATE DUE / RETURNED", 0, -4);

  const now = new Date();
  const dateStr = options.dateText || `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  ctx.font = 'bold 14px "Playfair Display", monospace';
  ctx.fillText(dateStr, 0, 12);
  ctx.restore();

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#3e2415';
  ctx.font = '800 24px "Playfair Display", Georgia, serif';
  ctx.letterSpacing = '2px';
  ctx.fillText((options.titleText || 'THE SECRET ARCHIVE').toUpperCase(), fCenterX, fY + 110);

  // Subtitle
  ctx.font = 'italic 500 14px "Playfair Display", Georgia, serif';
  ctx.fillStyle = '#6e452a';
  ctx.fillText(options.subText || 'Every chapter is a timeless memory ♡', fCenterX, fY + 134);

  // Quill flourish bottom line
  ctx.strokeStyle = '#8c5e3c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(fCenterX - 80, fY + 152);
  ctx.lineTo(fCenterX + 80, fY + 152);
  ctx.stroke();

  ctx.fillStyle = '#8c5e3c';
  ctx.beginPath();
  ctx.arc(fCenterX, fY + 152, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * RENDER THEME 3: Film 35mm Negatif (Kodak Cinema)
 */
function renderFilm35Theme(ctx, template, slots, footerRect, options) {
  const w = template.width;
  const h = template.height;

  // 1. Deep Matte Black Base
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, w, h);

  // 2. Film Sprocket Holes along Left and Right
  const holeW = 12;
  const holeH = 18;
  const holeRadius = 3;
  const holeStep = 32;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;

  for (let sy = 20; sy < h - 20; sy += holeStep) {
    // Left sprocket
    drawRoundedRect(ctx, 8, sy, holeW, holeH, holeRadius);
    ctx.fill();
    ctx.stroke();

    // Right sprocket
    drawRoundedRect(ctx, w - 8 - holeW, sy, holeW, holeH, holeRadius);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Film Markings along Margins (Kodak, Frame Numbers)
  ctx.save();
  ctx.fillStyle = '#f59e0b'; // Kodak gold/amber
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';

  const frameMarks = ["21A", "22", "22A", "23", "23A", "24", "24A"];
  frameMarks.forEach((mark, i) => {
    const markY = 120 + i * 220;
    if (markY < h - 180) {
      // Left edge markings
      ctx.fillText(`▶ ${mark}`, 26, markY);
      // Right edge markings
      ctx.fillText(`KODAK 400`, w - 28, markY);
    }
  });

  // Top header edge code
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText("SAFETY FILM • 35MM COLOR NEGATIVE • ISO 400", w / 2, 32);
  ctx.restore();

  // 4. Photo slots with sleek cinema borders
  slots.forEach((slot, i) => {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 4);
    ctx.stroke();

    // Film frame index indicator
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`EXP ${24 + i}`, slot.x + 8, slot.y + slot.height - 8);
  });

  // 5. Footer: Lab Stamp & Typography
  ctx.save();
  const fCenterX = footerRect.x + footerRect.width / 2;
  const fY = footerRect.y;

  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText((options.titleText || 'KODAK PORTRA 400').toUpperCase(), fCenterX, fY + 45);

  // Subtitle
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 13px monospace';
  ctx.letterSpacing = '1px';
  ctx.fillText(options.subText || 'DEVELOPED AT BERKAH LAB ♡', fCenterX, fY + 75);

  // Date and technical specs
  const now = new Date();
  const dateStr = options.dateText || `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  ctx.font = '500 11px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`BATCH #35-B • ROLL 04 • ${dateStr}`, fCenterX, fY + 105);

  // Decorative barcode
  ctx.fillStyle = '#ffffff';
  const bcWidth = 140;
  const bcX = fCenterX - bcWidth / 2;
  const bcY = fY + 120;
  for (let i = 0; i < bcWidth; i += 4) {
    const isThick = (i % 8 === 0) || (i % 12 === 0);
    ctx.fillRect(bcX + i, bcY, isThick ? 2.5 : 1, 20);
  }

  ctx.restore();
}

/**
 * RENDER THEME 4: Koran Jadul (The Daily Gazette)
 */
function renderNewspaperTheme(ctx, template, slots, footerRect, options) {
  const w = template.width;
  const h = template.height;

  // 1. Weathered Newsprint Background
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(0, 0, w, h);

  // Outer newspaper rule borders
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.lineWidth = 1;
  ctx.strokeRect(14, 14, w - 28, h - 28);

  // 2. Grand Masthead: The Daily Chronicles
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1c1917';
  ctx.font = '900 28px "Playfair Display", Georgia, serif';
  ctx.letterSpacing = '1px';
  ctx.fillText("THE DAILY CHRONICLES", w / 2, 44);

  // Masthead sub-bar with rules
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20, 52);
  ctx.lineTo(w - 20, 52);
  ctx.moveTo(20, 70);
  ctx.lineTo(w - 20, 70);
  ctx.stroke();

  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#44403c';
  const now = new Date();
  const dateStr = options.dateText || `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  ctx.fillText(`SPECIAL EDITION • ${dateStr} • PRICE 10 CENTS • VOL. XXIV`, w / 2, 64);
  ctx.restore();

  // 3. Photo slots with news photo borders & caption lines
  slots.forEach((slot, i) => {
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2;
    ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);

    // Headline tag above photo
    ctx.fillStyle = '#1c1917';
    ctx.font = 'italic 700 10px "Playfair Display", serif';
    ctx.fillText(`Fig. ${i + 1}: Exclusive Moment Capture`, slot.x + 4, slot.y - 4);
  });

  // 4. Footer: Headline & News Column
  ctx.save();
  const fCenterX = footerRect.x + footerRect.width / 2;
  const fY = footerRect.y;

  ctx.textAlign = 'center';

  // Bold News Headline
  ctx.fillStyle = '#1c1917';
  ctx.font = '900 24px "Playfair Display", Georgia, serif';
  ctx.fillText((options.titleText || 'HEADLINE OF THE DAY').toUpperCase(), fCenterX, fY + 45);

  // Subtitle news report
  ctx.font = 'italic 600 13px "Playfair Display", serif';
  ctx.fillStyle = '#44403c';
  ctx.fillText(options.subText || '"A historic celebration worth remembering for generations."', fCenterX, fY + 75);

  // Press Verification Stamp
  ctx.save();
  ctx.translate(fCenterX, fY + 125);
  ctx.rotate(-0.06);
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, -75, -16, 150, 32, 6);
  ctx.stroke();
  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 11px monospace';
  ctx.fillText("CERTIFIED PRESS", 0, 4);
  ctx.restore();

  ctx.restore();
}

/**
 * RENDER THEME 5: Y2K Cyber Pop / Arcade 2000s
 */
function renderY2KTheme(ctx, template, slots, footerRect, options) {
  const w = template.width;
  const h = template.height;

  // 1. Cyber Purple / Chrome Gradient Background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1a0b2e');
  grad.addColorStop(0.5, '#2e1065');
  grad.addColorStop(1, '#110524');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Cyber pixel grid
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Sparkling cyber stars
  const drawStar = (sx, sy, size, color) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx, sy - size);
    ctx.quadraticCurveTo(sx, sy, sx + size, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy + size);
    ctx.quadraticCurveTo(sx, sy, sx - size, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy - size);
    ctx.fill();
    ctx.restore();
  };

  drawStar(35, 70, 10, '#ec4899');
  drawStar(w - 35, 90, 14, '#38bdf8');
  drawStar(45, h - 180, 12, '#facc15');
  drawStar(w - 40, h - 210, 10, '#a855f7');

  // Header: Retro Window Header
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  drawRoundedRect(ctx, 20, 16, w - 40, 32, 8);
  ctx.fill();
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 20, 16, w - 40, 32, 8);
  ctx.stroke();

  ctx.fillStyle = '#f472b6';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText("★ Y2K_PHOTO_BOOTH.EXE", 36, 36);

  // Window control buttons
  ctx.textAlign = 'right';
  ctx.fillText("[― ◻ ✕]", w - 36, 36);
  ctx.restore();

  // Photo slots with neon border
  slots.forEach((slot, i) => {
    ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : '#f472b6';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 10);
    ctx.stroke();

    // Corner glow accents
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(slot.x + 4, slot.y + 4, 3, 3);
    ctx.fillRect(slot.x + slot.width - 7, slot.y + 4, 3, 3);
  });

  // Footer: Y2K Cyber Branding
  ctx.save();
  const fCenterX = footerRect.x + footerRect.width / 2;
  const fY = footerRect.y;

  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText((options.titleText || 'CYBER ARCHIVE 2000').toUpperCase(), fCenterX, fY + 45);

  // Subtitle
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(options.subText || '✦ DIGITAL MEMORY DISK ✦', fCenterX, fY + 75);

  // Date
  const now = new Date();
  const dateStr = options.dateText || `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  ctx.font = '500 11px monospace';
  ctx.fillStyle = '#c084fc';
  ctx.fillText(`SYSTEM BOOT: ${dateStr} • OK`, fCenterX, fY + 105);

  ctx.restore();
}

/**
 * RENDER THEME 6: Sakura Pastel Floral
 */
function renderSakuraTheme(ctx, template, slots, footerRect, options) {
  const w = template.width;
  const h = template.height;

  // 1. Soft Pastel Blossom Gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#fff5f7');
  grad.addColorStop(0.5, '#fde2e8');
  grad.addColorStop(1, '#fad2dc');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Outer floral border
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 10, 10, w - 20, h - 20, 16);
  ctx.stroke();

  // Floating Cherry Blossom Petals
  const drawPetal = (px, py, radius, rotDeg) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((rotDeg * Math.PI) / 180);
    ctx.fillStyle = 'rgba(244, 114, 182, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawPetal(35, 45, 8, 30);
  drawPetal(w - 40, 60, 10, -45);
  drawPetal(w - 55, 85, 7, 20);
  drawPetal(28, h - 210, 9, 60);
  drawPetal(w - 30, h - 190, 8, -25);

  // Header Korean Romance
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#db2777';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText("봄날의 기억 • Spring Blossoms ♡", w / 2, 42);
  ctx.restore();

  // Photo slots with soft blossom pink border
  slots.forEach((slot) => {
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 12);
    ctx.stroke();

    // Subtle inner glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, slot.x + 2, slot.y + 2, slot.width - 4, slot.height - 4, 10);
    ctx.stroke();
  });

  // Footer: Romantic Calligraphy & Branding
  ctx.save();
  const fCenterX = footerRect.x + footerRect.width / 2;
  const fY = footerRect.y;

  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#9d174d';
  ctx.font = '800 24px "Outfit", "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText((options.titleText || 'SAKURA MOMENTS').toUpperCase(), fCenterX, fY + 45);

  // Subtitle
  ctx.fillStyle = '#be185d';
  ctx.font = 'italic 600 14px "Playfair Display", Georgia, serif';
  ctx.fillText(options.subText || 'Sweet memories like spring flowers ♡', fCenterX, fY + 75);

  // Date
  const now = new Date();
  const dateStr = options.dateText || `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  ctx.font = '500 12px "Plus Jakarta Sans", monospace';
  ctx.fillStyle = '#db2777';
  ctx.fillText(dateStr, fCenterX, fY + 105);

  ctx.restore();
}

/**
 * RENDER THEME 7: Washi Tape Scrapbook
 */
function renderScrapbookTheme(ctx, template, slots, footerRect, options) {
  const w = template.width;
  const h = template.height;

  // 1. Grid Paper / Notebook Cardboard Background
  ctx.fillStyle = '#faf8f2';
  ctx.fillRect(0, 0, w, h);

  // Subtle notebook dots
  ctx.fillStyle = 'rgba(120, 113, 108, 0.15)';
  for (let gx = 16; gx < w; gx += 20) {
    for (let gy = 16; gy < h; gy += 20) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Header doodle
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#44403c';
  ctx.font = 'bold 15px "Outfit", sans-serif';
  ctx.fillText("SCRAPBOOK JOURNAL • SPECIAL EDITION ✂️", w / 2, 40);
  ctx.restore();

  // Photo slots with diagonal washi tape on corners!
  const tapeColors = [
    'rgba(251, 191, 36, 0.8)', // yellow
    'rgba(244, 114, 182, 0.8)', // pink
    'rgba(56, 189, 248, 0.8)', // cyan
    'rgba(74, 222, 128, 0.8)'  // green
  ];

  slots.forEach((slot, i) => {
    // Polarid-like card backing
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, slot.x - 4, slot.y - 4, slot.width + 8, slot.height + 8, 6);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 4);
    ctx.stroke();

    // Washi tape on top-left and top-right corners
    const color1 = tapeColors[i % tapeColors.length];
    const color2 = tapeColors[(i + 1) % tapeColors.length];
    drawWashiTape(ctx, slot.x + 8, slot.y + 4, 48, 16, -22, color1);
    drawWashiTape(ctx, slot.x + slot.width - 8, slot.y + 4, 48, 16, 22, color2);
  });

  // Footer: Scrapbook Journaling
  ctx.save();
  const fCenterX = footerRect.x + footerRect.width / 2;
  const fY = footerRect.y;

  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#292524';
  ctx.font = '800 24px "Outfit", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText((options.titleText || 'PHOTO SCRAPBOOK').toUpperCase(), fCenterX, fY + 45);

  // Subtitle
  ctx.fillStyle = '#78716c';
  ctx.font = 'italic 600 14px "Playfair Display", Georgia, serif';
  ctx.fillText(options.subText || 'Every moment taped with love ♡', fCenterX, fY + 75);

  // Date Tag
  const now = new Date();
  const dateStr = options.dateText || `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  drawWashiTape(ctx, fCenterX, fY + 110, 140, 24, 0, 'rgba(251, 191, 36, 0.7)');
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#78350f';
  ctx.fillText(dateStr, fCenterX, fY + 114);

  ctx.restore();
}

/**
 * RENDER THEME 8: Minimalis Studio (Classic Solid)
 */
function renderClassicTheme(ctx, template, slots, footerRect, options) {
  const w = template.width;
  const h = template.height;
  const frameColor = getFrameColor(options.frameColorId);

  // Outer frame background
  ctx.fillStyle = frameColor.bg;
  ctx.fillRect(0, 0, w, h);

  // Outer border accent
  ctx.strokeStyle = frameColor.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Photo slots
  slots.forEach((slot) => {
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 12);
    ctx.stroke();
  });

  // Footer Typography & Branding
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const footerCenterX = footerRect.x + footerRect.width / 2;
  const footerCenterY = footerRect.y + footerRect.height / 2;

  // Title
  ctx.fillStyle = frameColor.text;
  ctx.font = '800 24px "Outfit", "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText((options.titleText || 'BERKAH BOOTH').toUpperCase(), footerCenterX, footerCenterY - 24);

  // Subtitle / Event note
  ctx.fillStyle = frameColor.subtext;
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(options.subText || 'MEMORIES THAT LAST ♡', footerCenterX, footerCenterY + 8);

  // Date and Time
  const now = new Date();
  const defaultDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} • ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  ctx.font = '500 12px "Plus Jakarta Sans", monospace';
  ctx.fillStyle = frameColor.subtext;
  ctx.fillText(options.dateText || defaultDate, footerCenterX, footerCenterY + 36);

  // Tiny decorative studio line
  ctx.strokeStyle = frameColor.subtext;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(footerCenterX - 60, footerCenterY + 54);
  ctx.lineTo(footerCenterX + 60, footerCenterY + 54);
  ctx.stroke();

  ctx.restore();
}

/**
 * Main Render Function: Orchestrates Theme Background, Photos, Stickers & Text
 */
export async function renderCollage({
  templateId = 'strip_4',
  frameThemeId = 'prison', // default or selected theme
  frameColorId = 'white',
  photos = [],
  filterId = 'normal',
  titleText = 'BERKAH BOOTH',
  subText = 'SPECIAL MOMENTS ♡',
  dateText = '',
  stickers = [],
  scale = 1.0
}) {
  const template = TEMPLATES[templateId] || TEMPLATES.strip_4;
  const themeMargin = frameThemeId === 'film35' ? 14 : frameThemeId === 'prison' ? 10 : 0;
  const { slots, footerRect } = template.getSlots(template.width, template.height, themeMargin);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(template.width * scale);
  canvas.height = Math.round(template.height * scale);
  const ctx = canvas.getContext('2d');

  ctx.scale(scale, scale);

  const themeOptions = {
    titleText,
    subText,
    dateText,
    frameColorId
  };

  // 1. Draw Themed Background & Border Decor
  switch (frameThemeId) {
    case 'prison':
      renderPrisonTheme(ctx, template, slots, footerRect, themeOptions);
      break;
    case 'library':
      renderLibraryTheme(ctx, template, slots, footerRect, themeOptions);
      break;
    case 'film35':
      renderFilm35Theme(ctx, template, slots, footerRect, themeOptions);
      break;
    case 'newspaper':
      renderNewspaperTheme(ctx, template, slots, footerRect, themeOptions);
      break;
    case 'y2k':
      renderY2KTheme(ctx, template, slots, footerRect, themeOptions);
      break;
    case 'sakura':
      renderSakuraTheme(ctx, template, slots, footerRect, themeOptions);
      break;
    case 'scrapbook':
      renderScrapbookTheme(ctx, template, slots, footerRect, themeOptions);
      break;
    case 'classic':
    default:
      renderClassicTheme(ctx, template, slots, footerRect, themeOptions);
      break;
  }

  // 2. Render Photos into each slot (center-crop with active filter)
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const photo = photos[i];

    ctx.save();
    // Clip rounded photo container
    const radius = frameThemeId === 'film35' ? 4 : frameThemeId === 'newspaper' ? 0 : 10;
    drawRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, radius);
    ctx.clip();

    if (photo) {
      applyFilterToCanvas(ctx, filterId);

      const imgW = photo.width || photo.naturalWidth || slot.width;
      const imgH = photo.height || photo.naturalHeight || slot.height;
      const imgAspect = imgW / imgH;
      const slotAspect = slot.width / slot.height;

      let sx = 0, sy = 0, sw = imgW, sh = imgH;
      if (imgAspect > slotAspect) {
        sw = imgH * slotAspect;
        sx = (imgW - sw) / 2;
      } else {
        sh = imgW / slotAspect;
        sy = (imgH - sh) / 2;
      }

      ctx.drawImage(photo, sx, sy, sw, sh, slot.x, slot.y, slot.width, slot.height);
      ctx.filter = 'none';
    } else {
      // Empty placeholder slot
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
      ctx.fillStyle = frameThemeId === 'prison' || frameThemeId === 'film35' || frameThemeId === 'y2k' ? '#94a3b8' : '#78716c';
      ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Foto ${i + 1}`, slot.x + slot.width / 2, slot.y + slot.height / 2);
    }
    ctx.restore();
  }

  // 3. Render Stickers
  if (stickers && stickers.length > 0) {
    for (const sticker of stickers) {
      ctx.save();
      const sx = sticker.x * template.width;
      const sy = sticker.y * template.height;
      ctx.translate(sx, sy);
      ctx.rotate(((sticker.rotation || 0) * Math.PI) / 180);
      const sScale = sticker.scale || 1.0;
      ctx.scale(sScale, sScale);

      if (sticker.type === 'emoji') {
        ctx.font = '48px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.content, 0, 0);
      }
      ctx.restore();
    }
  }

  return canvas;
}
