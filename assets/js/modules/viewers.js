import { state } from './state.js';
import { loadImage, releaseMedia } from './files.js';
import { convertToAnaglyph } from './anaglyph.js';
const el = s => document.querySelector(s);
function imagePair(source) {
  const pair = document.createElement('div'); pair.className = 'stereo-pair';
  for (const side of ['left','right']) { const eye = document.createElement('div'); eye.className = `eye-view ${side}`; const img = document.createElement('img'); img.src = source; img.alt = `Perspectiva ${side === 'left' ? 'izquierda' : 'derecha'}`; eye.append(img); pair.append(eye); }
  return pair;
}
export async function showImage(url, module, { anaglyphMode = '2d' } = {}) {
  const img = await loadImage(url); state.width = img.naturalWidth; state.height = img.naturalHeight;
  const visual = el('#visual'); visual.replaceChildren();
  if (module === 'anaglyph' && anaglyphMode !== 'prepared') {
    const result = convertToAnaglyph(img, { source: anaglyphMode === 'sbs' ? 'sbs' : '2d' }); result.className = 'anaglyph-image'; result.setAttribute('role','img'); result.setAttribute('aria-label', anaglyphMode === 'sbs' ? 'Imagen SBS convertida a anaglifo rojo-cian' : 'Efecto anaglifo rojo-cian simulado desde imagen 2D');
    state.width = result.width; visual.append(result);
  } else if (module === 'anaglyph') { img.className = 'anaglyph-image'; img.alt = 'Imagen anaglifo rojo-cian'; visual.append(img); }
  else visual.append(imagePair(url));
  ready(module, anaglyphMode);
}
export function showVideo(url) {
  const video = document.createElement('video'); video.src = url; video.playsInline = true; video.preload = 'metadata'; video.controls = false; video.setAttribute('playsinline','');
  state.media = video;
  let durationRejected = false;
  const pair = document.createElement('div'); pair.className = 'stereo-pair';
  for (const side of ['left','right']) { const eye = document.createElement('div'); eye.className = `eye-view ${side}`; const view = document.createElement('video'); view.src = url; view.playsInline = true; view.muted = true; view.preload = 'metadata'; view.setAttribute('playsinline',''); eye.append(view); pair.append(eye); }
  const visual = el('#visual'); visual.replaceChildren(pair);
  video.addEventListener('loadedmetadata', () => {
    if (video.duration > 15) {
      durationRejected = true;
      releaseMedia(state); visual.replaceChildren(); visual.classList.add('hidden'); el('#empty-state').classList.remove('hidden'); el('#video-controls').classList.add('hidden'); el('#file-card').classList.add('hidden'); el('#vr-button').disabled = true; el('#reset-button').disabled = true;
      el('#state-label').textContent = 'Duración no permitida'; el('#caption-text').textContent = `El video dura ${formatTime(video.duration)}. El máximo permitido es 15 segundos; selecciona un video más corto.`;
      return;
    }
    state.width = video.videoWidth; state.height = video.videoHeight; el('#duration').textContent = formatTime(video.duration); ready('video'); visual.querySelectorAll('.eye-view video').forEach(v => { v.currentTime = video.currentTime; });
  });
  video.addEventListener('error', () => { if (durationRejected) return; el('#state-label').textContent = 'Error de reproducción'; el('#caption-text').textContent = 'El navegador no pudo reproducir este MP4. Prueba con otro video compatible.'; });
  video.addEventListener('play', () => { el('#play-button').textContent = 'Ⅱ'; el('#state-label').textContent = 'Reproduciendo'; syncFrame(); });
  video.addEventListener('pause', () => { el('#play-button').textContent = '▶'; if (state.file) el('#state-label').textContent = 'Pausado'; cancelAnimationFrame(state.raf); visual.querySelectorAll('.eye-view video').forEach(v => v.pause()); });
  video.addEventListener('timeupdate', () => { el('#current-time').textContent = formatTime(video.currentTime); if (Number.isFinite(video.duration) && video.duration) el('#seek').value = Math.round(video.currentTime / video.duration * 1000); });
  video.load(); el('#video-controls').classList.remove('hidden');
}
function syncFrame() {
  if (!state.media || state.media.paused) return;
  const t = state.media.currentTime, visual = el('#visual');
  visual.querySelectorAll('.eye-view video').forEach(v => { if (Math.abs(v.currentTime - t) > .04) v.currentTime = t; if (v.paused) v.play().catch(() => {}); });
  state.raf = requestAnimationFrame(syncFrame);
}
export function formatTime(t) { if (!Number.isFinite(t)) return '0:00'; const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2,'0')}`; }
function ready(module, anaglyphMode = 'prepared') {
  el('#empty-state').classList.add('hidden'); el('#visual').classList.remove('hidden'); el('#vr-button').disabled = module === 'anaglyph'; el('#reset-button').disabled = false;
  el('#state-label').textContent = module === 'video' ? 'Listo para reproducir' : 'Imagen lista';
  el('#dimensions').textContent = `${state.width} × ${state.height} px`;
  el('#caption-text').textContent = module === 'anaglyph' ? (anaglyphMode === '2d' ? 'Efecto rojo-cian aplicado. En una foto 2D la profundidad es simulada; usa lentes rojo-cian.' : anaglyphMode === 'sbs' ? 'Imagen SBS convertida a anaglifo. Usa lentes rojo-cian para verla en 3D.' : 'Usa lentes rojo-cian para separar los canales del anaglifo.') : 'Perspectivas izquierda y derecha recortadas desde el archivo original.';
}
