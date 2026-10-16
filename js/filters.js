/**
 * BerkahBooth Aesthetic Filter Engine
 * Supports real-time CSS filters on webcam and Canvas 2D render filters
 */

export const FILTERS = [
  {
    id: 'normal',
    name: 'Normal',
    icon: '✨',
    cssFilter: 'none',
    canvasFilter: 'none',
    description: 'Warna asli natural'
  },
  {
    id: 'korean-bloom',
    name: 'Korean Soft',
    icon: '🌸',
    cssFilter: 'brightness(1.08) contrast(0.96) saturate(1.15)',
    canvasFilter: 'brightness(108%) contrast(96%) saturate(115%)',
    description: 'Cerah, lembut & glowing'
  },
  {
    id: 'bw-studio',
    name: 'Noir B&W',
    icon: '🖤',
    cssFilter: 'grayscale(1) contrast(1.25) brightness(0.95)',
    canvasFilter: 'grayscale(100%) contrast(125%) brightness(95%)',
    description: 'Hitam putih klasik berdimensi'
  },
  {
    id: 'vintage-sepia',
    name: 'Warm Retro',
    icon: '☕',
    cssFilter: 'sepia(0.6) contrast(1.1) brightness(1.02) saturate(1.2)',
    canvasFilter: 'sepia(60%) contrast(110%) brightness(102%) saturate(120%)',
    description: 'Nuansa hangat kecokelatan 90an'
  },
  {
    id: 'film-grain',
    name: 'Analog Film',
    icon: '🎞️',
    cssFilter: 'sepia(0.25) contrast(1.18) brightness(0.96) hue-rotate(-10deg)',
    canvasFilter: 'sepia(25%) contrast(118%) brightness(96%) hue-rotate(-10deg)',
    description: 'Gaya kamera analog vintage'
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk',
    icon: '⚡',
    cssFilter: 'contrast(1.25) saturate(1.5) hue-rotate(185deg)',
    canvasFilter: 'contrast(125%) saturate(150%) hue-rotate(185deg)',
    description: 'Vibrant neon aesthetic'
  }
];

export function getFilterById(id) {
  return FILTERS.find(f => f.id === id) || FILTERS[0];
}

/**
 * Apply filter onto a canvas 2D context before drawing
 */
export function applyFilterToCanvas(ctx, filterId) {
  const filter = getFilterById(filterId);
  if (filter && filter.canvasFilter) {
    ctx.filter = filter.canvasFilter;
  } else {
    ctx.filter = 'none';
  }
}
