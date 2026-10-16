/**
 * BerkahBooth Camera Manager
 * Manages webcam access, mirror mode, device switching, and high-res snapshot capture
 */
export class CameraManager {
  constructor(videoElement, options = {}) {
    this.video = videoElement;
    this.stream = null;
    this.isMirrored = options.isMirrored ?? true;
    this.currentDeviceId = null;
    this.availableDevices = [];
    this.isMockActive = false;
    this.mockAnimationId = null;
  }

  async init() {
    try {
      await this.getAvailableDevices();
      await this.startStream();
      return { success: true };
    } catch (err) {
      console.warn("Camera init failed, checking fallback:", err);
      return { success: false, error: err };
    }
  }

  async getAvailableDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(d => d.kind === 'videoinput');
      return this.availableDevices;
    } catch (e) {
      console.warn("Could not enumerate devices:", e);
      return [];
    }
  }

  async startStream(deviceId = null) {
    this.stopStream();

    const constraints = {
      audio: false,
      video: {
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        facingMode: deviceId ? undefined : 'user',
        deviceId: deviceId ? { exact: deviceId } : undefined
      }
    };

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("navigator.mediaDevices.getUserMedia is not supported.");
      }
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();
      this.currentDeviceId = deviceId;
      this.isMockActive = false;
      this.applyMirror();
      await this.getAvailableDevices();
      return true;
    } catch (error) {
      console.error("Camera access error:", error);
      throw error;
    }
  }

  stopStream() {
    if (this.mockAnimationId) {
      cancelAnimationFrame(this.mockAnimationId);
      this.mockAnimationId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  setMirror(enabled) {
    this.isMirrored = enabled;
    this.applyMirror();
  }

  toggleMirror() {
    this.setMirror(!this.isMirrored);
    return this.isMirrored;
  }

  applyMirror() {
    if (this.video) {
      this.video.style.transform = this.isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
    }
  }

  /**
   * Start mock simulator if no physical webcam is detected (e.g. testing in sandbox)
   */
  startMockCamera() {
    this.stopStream();
    this.isMockActive = true;

    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1280;
    mockCanvas.height = 720;
    const ctx = mockCanvas.getContext('2d');

    let frame = 0;
    const draw = () => {
      frame++;
      // Animated studio gradient
      const grad = ctx.createLinearGradient(0, 0, mockCanvas.width, mockCanvas.height);
      const hue1 = (frame * 0.4) % 360;
      const hue2 = (hue1 + 60) % 360;
      grad.addColorStop(0, `hsl(${hue1}, 70%, 25%)`);
      grad.addColorStop(1, `hsl(${hue2}, 60%, 15%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);

      // Studio lights overlay
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(640, 360, 240 + Math.sin(frame * 0.05) * 20, 0, Math.PI * 2);
      ctx.fill();

      // Stylized silhouette / avatar simulation
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("📸 BerkahBooth Studio Simulator", 640, 280);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText("Simulasi Kamera Aktif • Senyum ke Kamera!", 640, 330);

      // Animated smiley face
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(640, 440, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(620, 425, 8, 0, Math.PI * 2);
      ctx.arc(660, 425, 8, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.beginPath();
      ctx.arc(640, 445, 30, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      ctx.restore();

      this.mockAnimationId = requestAnimationFrame(draw);
    };

    draw();

    // Stream from canvas to video element
    const stream = mockCanvas.captureStream(30);
    this.video.srcObject = stream;
    this.video.play().catch(e => console.warn(e));
    this.stream = stream;
    this.applyMirror();
  }

  /**
   * Captures a single still photo frame from the current stream
   * Returns a high quality dataURL or Canvas
   */
  captureFrame(targetWidth = 1280, targetHeight = 960) {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    const videoWidth = this.video.videoWidth || 1280;
    const videoHeight = this.video.videoHeight || 720;

    // Calculate center-crop aspect ratio to match target canvas
    const targetAspect = targetWidth / targetHeight;
    const videoAspect = videoWidth / videoHeight;

    let sx = 0, sy = 0, sw = videoWidth, sh = videoHeight;
    if (videoAspect > targetAspect) {
      sw = videoHeight * targetAspect;
      sx = (videoWidth - sw) / 2;
    } else {
      sh = videoWidth / targetAspect;
      sy = (videoHeight - sh) / 2;
    }

    ctx.save();
    if (this.isMirrored) {
      // Mirror horizontally to match preview
      ctx.translate(targetWidth, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(this.video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
    ctx.restore();

    return canvas;
  }
}
