import { state } from './state.js';
import { loadImage, releaseMedia } from './files.js';
import { convertToAnaglyph } from './anaglyph.js';
import { setControlsEnabled } from './controls.js';
const el = s => document.querySelector(s);
function imagePair(source) {
  const pair = document.createElement('div'); pair.className = 'stereo-pair';
  const eyeWidth = Math.floor(source.naturalWidth / 2);
  if (eyeWidth < 1) throw new Error('La imagen SBS debe contener una vista para cada ojo.');
  for (const [index, side] of ['left','right'].entries()) {
    const eye = document.createElement('div'); eye.className = `eye-view ${side}`;
    const canvas = document.createElement('canvas'); canvas.width = eyeWidth; canvas.height = source.naturalHeight;
    canvas.setAttribute('role','img'); canvas.setAttribute('aria-label',`Perspectiva ${side === 'left' ? 'izquierda' : 'derecha'}`);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('El navegador no pudo preparar la vista SBS.');
    const sx = index === 0 ? 0 : eyeWidth, sw = index === 0 ? eyeWidth : source.naturalWidth - eyeWidth;
    context.drawImage(source, sx, 0, sw, source.naturalHeight, 0, 0, canvas.width, canvas.height);
    eye.append(canvas); pair.append(eye);
  }
  return pair;
}
export async function showImage(url, module, { anaglyphMode = '2d' } = {}) {
  const img = await loadImage(url);
  if (state.url !== url) return;
  state.width = img.naturalWidth; state.height = img.naturalHeight;
  const visual = el('#visual'); visual.replaceChildren();
  if (module === 'anaglyph' && anaglyphMode !== 'prepared') {
    const result = convertToAnaglyph(img, { source: anaglyphMode === 'sbs' ? 'sbs' : '2d' }); result.className = 'anaglyph-image'; result.setAttribute('role','img'); result.setAttribute('aria-label', anaglyphMode === 'sbs' ? 'Imagen SBS convertida a anaglifo rojo-cian' : 'Efecto anaglifo rojo-cian simulado desde imagen 2D');
    state.width = result.width; visual.append(result);
  } else if (module === 'anaglyph') { img.className = 'anaglyph-image'; img.alt = 'Imagen anaglifo rojo-cian'; visual.append(img); }
  else { state.width = Math.floor(img.naturalWidth / 2); visual.append(imagePair(img)); }
  ready(module, anaglyphMode);
}
export function showVideo(url) {
  const video = document.createElement('video'); video.src = url; video.playsInline = true; video.preload = 'metadata'; video.controls = false; video.setAttribute('playsinline','');
  state.media = video;
  let durationRejected = false;
  const isCurrent = () => state.media === video && state.url === url;
  const pair = document.createElement('div'); pair.className = 'stereo-pair';
  for (const side of ['left','right']) { const eye = document.createElement('div'); eye.className = `eye-view ${side}`; const view = document.createElement('canvas'); view.setAttribute('role','img'); view.setAttribute('aria-label', `Vista ${side === 'left' ? 'izquierda' : 'derecha'} del video SBS`); eye.append(view); pair.append(eye); }
  const visual = el('#visual'); visual.replaceChildren(pair);
  video.addEventListener('loadedmetadata', () => {
    if (!isCurrent()) return;
    if (video.duration > 15) {
      durationRejected = true;
      releaseMedia(state); visual.replaceChildren(); visual.classList.add('hidden'); el('#empty-state').classList.remove('hidden'); el('#video-controls').classList.add('hidden'); el('#file-card').classList.add('hidden'); el('#vr-button').disabled = true; el('#reset-button').disabled = true;
      setControlsEnabled(false);
      el('#state-label').textContent = 'Duración no permitida'; el('#caption-text').textContent = `El video dura ${video.duration.toFixed(1)} segundos. El máximo permitido es 15 segundos; selecciona un video más corto.`;
      return;
    }
    state.width = video.videoWidth; state.height = video.videoHeight;
    visual.querySelectorAll('.eye-view canvas').forEach(canvas => { canvas.width = Math.max(1, Math.floor(video.videoWidth / 2)); canvas.height = video.videoHeight; });
    el('#duration').textContent = formatTime(video.duration); ready('video'); drawVideoFrame(video, visual);
  });
  video.addEventListener('error', () => { if (durationRejected || !isCurrent()) return; el('#state-label').textContent = 'Error de reproducción'; el('#caption-text').textContent = 'El navegador no pudo reproducir este MP4. Prueba con otro video compatible.'; });
  video.addEventListener('play', () => { if (!isCurrent()) return; el('#play-button').textContent = 'Ⅱ'; el('#state-label').textContent = 'Reproduciendo'; syncFrame(); });
  video.addEventListener('pause', () => { if (!isCurrent()) return; el('#play-button').textContent = '▶'; if (state.file) el('#state-label').textContent = 'Pausado'; cancelAnimationFrame(state.raf); drawVideoFrame(video, visual); });
  video.addEventListener('seeked', () => { if (isCurrent()) drawVideoFrame(video, visual); });
  video.addEventListener('timeupdate', () => { if (!isCurrent()) return; el('#current-time').textContent = formatTime(video.currentTime); if (Number.isFinite(video.duration) && video.duration) el('#seek').value = Math.round(video.currentTime / video.duration * 1000); });
  video.load(); el('#video-controls').classList.remove('hidden');
}
function drawVideoFrame(video, visual) {
  if (video.readyState < 2 || !video.videoWidth) return;
  const halfWidth = Math.floor(video.videoWidth / 2), height = video.videoHeight;
  visual.querySelectorAll('.eye-view canvas').forEach((canvas, index) => {
    const context = canvas.getContext('2d'); if (!context) return;
    const sx = index === 0 ? 0 : halfWidth;
    const sw = index === 0 ? halfWidth : video.videoWidth - halfWidth;
    context.drawImage(video, sx, 0, sw, height, 0, 0, canvas.width, canvas.height);
  });
}
function syncFrame() {
  if (!state.media || state.media.paused) return;
  drawVideoFrame(state.media, el('#visual'));
  state.raf = requestAnimationFrame(syncFrame);
}
export function formatTime(t) { if (!Number.isFinite(t)) return '0:00'; const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2,'0')}`; }
function ready(module, anaglyphMode = 'prepared') {
  el('#empty-state').classList.add('hidden'); el('#visual').classList.remove('hidden'); el('#vr-button').disabled = module === 'anaglyph'; el('#reset-button').disabled = false;
  setControlsEnabled(true);
  el('#state-label').textContent = module === 'video' ? 'Listo para reproducir' : 'Imagen lista';
  el('#dimensions').textContent = `${state.width} × ${state.height} px`;
  el('#caption-text').textContent = module === 'anaglyph' ? (anaglyphMode === '2d' ? 'Efecto rojo-cian aplicado. En una foto 2D la profundidad es simulada; usa lentes rojo-cian.' : anaglyphMode === 'sbs' ? 'Imagen SBS convertida a anaglifo. Usa lentes rojo-cian para verla en 3D.' : 'Usa lentes rojo-cian para separar los canales del anaglifo.') : 'Perspectivas izquierda y derecha recortadas desde el archivo original.';
}
