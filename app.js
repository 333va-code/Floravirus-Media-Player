// app.js
const CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const CHAR_COUNT = CHARS.length;
const TARGET_WIDTH = 200;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

const video = document.getElementById('video-source');
const fileUpload = document.getElementById('file-upload');
const viewport = document.getElementById('viewport');
const asciiCanvas = document.getElementById('ascii-canvas');
const asciiCtx = asciiCanvas.getContext('2d');
const procCanvas = document.getElementById('proc-canvas');
const procCtx = procCanvas.getContext('2d', { willReadFrequently: true });

const btnPlay = document.getElementById('btn-play');
const btnPause = document.getElementById('btn-pause');
const btnStop = document.getElementById('btn-stop');
const seekBar = document.getElementById('seek-bar');
const trackStatus = document.getElementById('track-status');
const timeDisplay = document.getElementById('time-display');

let lastFrameTime = 0;
let animationFrameId = null;
let fontWidth = 6;
let fontHeight = 9;

const lut5 = new Uint8Array(256);
const lut6 = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  lut5[i] = (i >> 3) * 8.2258;
  lut6[i] = (i >> 2) * 4.0476;
}

fileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  trackStatus.textContent = file.name.toUpperCase();
  video.src = URL.createObjectURL(file);

  video.onloadedmetadata = () => {
    recalculateDimensions();
    video.play();
    animationFrameId = requestAnimationFrame(renderLoop);
  };
});

function recalculateDimensions() {
  if (!video.videoWidth || !video.videoHeight) return;

  const aspectRatio = video.videoHeight / video.videoWidth;
  const targetHeight = Math.round(TARGET_WIDTH * aspectRatio * 0.5);

  procCanvas.width = TARGET_WIDTH;
  procCanvas.height = targetHeight;

  const nativeAsciiWidth = TARGET_WIDTH * fontWidth;
  const nativeAsciiHeight = targetHeight * fontHeight;

  const viewWidth = viewport.clientWidth;
  const viewHeight = viewport.clientHeight;

  const scale = Math.min(viewWidth / nativeAsciiWidth, viewHeight / nativeAsciiHeight);

  asciiCanvas.width = nativeAsciiWidth;
  asciiCanvas.height = nativeAsciiHeight;

  asciiCanvas.style.width = `${Math.floor(nativeAsciiWidth * scale)}px`;
  asciiCanvas.style.height = `${Math.floor(nativeAsciiHeight * scale)}px`;

  asciiCtx.font = `${fontHeight}px "Courier New", monospace`;
  asciiCtx.textBaseline = 'top';
}

window.addEventListener('resize', recalculateDimensions);

function renderLoop(currentTime) {
  animationFrameId = requestAnimationFrame(renderLoop);

  if (currentTime - lastFrameTime < FRAME_INTERVAL) return;
  lastFrameTime = currentTime;

  if (!video.paused && !video.ended) {
    updateSeekUI();
    procCtx.drawImage(video, 0, 0, procCanvas.width, procCanvas.height);
    const imgData = procCtx.getImageData(0, 0, procCanvas.width, procCanvas.height).data;

    asciiCtx.fillStyle = '#08080a';
    asciiCtx.fillRect(0, 0, asciiCanvas.width, asciiCanvas.height);

    for (let y = 0; y < procCanvas.height; y++) {
      for (let x = 0; x < procCanvas.width; x++) {
        const idx = (y * procCanvas.width + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];

        const r16 = lut5[r];
        const g16 = lut6[g];
        const b16 = lut5[b];

        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const charIndex = Math.floor(brightness * (CHAR_COUNT - 1));

        asciiCtx.fillStyle = `rgb(${r16},${g16},${b16})`;
        asciiCtx.fillText(CHARS[charIndex], x * fontWidth, y * fontHeight);
      }
    }
  }
}

function updateSeekUI() {
  if (!video.duration) return;
  seekBar.value = (video.currentTime / video.duration) * 100;

  const curM = Math.floor(video.currentTime / 60).toString().padStart(2, '0');
  const curS = Math.floor(video.currentTime % 60).toString().padStart(2, '0');
  const durM = Math.floor(video.duration / 60).toString().padStart(2, '0');
  const durS = Math.floor(video.duration % 60).toString().padStart(2, '0');

  timeDisplay.textContent = `${curM}:${curS} / ${durM}:${durS}`;
}

btnPlay.addEventListener('click', () => video.play());
btnPause.addEventListener('click', () => video.pause());
btnStop.addEventListener('click', () => {
  video.pause();
  video.currentTime = 0;
  updateSeekUI();
});

seekBar.addEventListener('input', () => {
  if (!video.duration) return;
  video.currentTime = (seekBar.value / 100) * video.duration;
});