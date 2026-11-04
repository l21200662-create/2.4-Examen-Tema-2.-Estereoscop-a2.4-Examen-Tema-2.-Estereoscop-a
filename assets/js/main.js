import { modules, state } from './modules/state.js';
import { validateFile, releaseMedia } from './modules/files.js';
import { renderControls, resetSettings, applySettings } from './modules/controls.js';
import { showImage, showVideo, formatTime } from './modules/viewers.js';
const $ = selector => document.querySelector(selector);
const notice = message => { $('#caption-text').textContent = message; $('#state-label').textContent = 'Revisa el archivo'; };
function resetView() {
  releaseMedia(state); state.settings = { zoom: 100, brightness: 100, contrast: 100, offset: 0, vertical: 0, swap: false };
  $('#visual').replaceChildren(); $('#visual').classList.add('hidden'); $('#empty-state').classList.remove('hidden'); $('#video-controls').classList.add('hidden');
  $('#file-card').classList.add('hidden'); $('#vr-button').disabled = true; $('#reset-button').disabled = true; $('#dimensions').textContent = '—';
  $('#state-label').textContent = 'Sin contenido'; $('#caption-text').textContent = 'Carga un archivo compatible para comenzar.'; $('#file-input').value = '';
}
function setModule(key) {
  state.module = key; resetView();
  document.querySelectorAll('.module').forEach(button => { const active = button.dataset.module === key; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
  const info = modules[key]; $('#module-title').textContent = info.title; $('#module-description').textContent = info.description; $('#viewer-mode').textContent = info.label; $('#accepted-formats').textContent = info.formats; $('#file-input').accept = info.accept; $('#how-text').textContent = info.how;
  $('#anaglyph-source-wrap').classList.toggle('hidden', key !== 'anaglyph');
  if (key === 'anaglyph') updateAnaglyphSource();
  renderControls(key);
}
function updateAnaglyphSource() {
  const mode = $('#anaglyph-source').value;
  $('#accepted-formats').textContent = mode === 'sbs' ? 'JPG, PNG o WebP · SBS con vista izquierda y derecha' : mode === 'prepared' ? 'JPG, PNG o WebP · anaglifo rojo-cian ya preparado' : 'JPG, PNG o WebP · cualquier imagen (efecto 2D)';
  $('#module-description').textContent = mode === 'sbs' ? 'Carga una imagen SBS y conviértela a anaglifo rojo-cian.' : mode === 'prepared' ? 'Visualiza un anaglifo rojo-cian ya preparado.' : 'Carga cualquier imagen para aplicar el efecto rojo-cian.';
  $('#how-text').textContent = mode === 'sbs' ? 'La mitad izquierda del SBS aporta el rojo y la derecha el cian. Se necesitan dos perspectivas distintas para conservar la profundidad.' : mode === 'prepared' ? 'Este modo abre un anaglifo que ya contiene los canales rojo y cian. Usa lentes rojo-cian para verlo en 3D.' : 'La app separa ligeramente los canales de color para crear el aspecto anaglifo. Una imagen 2D no contiene profundidad real.';
}
async function importFile(file) {
  if (!file) return;
  const error = validateFile(file, state.module); if (error) { notice(error); return; }
  resetView(); state.settings = { zoom: 100, brightness: 100, contrast: 100, offset: 0, vertical: 0, swap: false }; renderControls(state.module);
  $('#state-label').textContent = 'Preparando archivo…'; $('#caption-text').textContent = 'Validando y decodificando el contenido local.';
  const url = URL.createObjectURL(file); state.url = url; state.file = file;
  try {
    if (state.module === 'video') showVideo(url); else await showImage(url, state.module, { anaglyphMode: state.module === 'anaglyph' ? $('#anaglyph-source').value : 'prepared' });
    $('#file-name').textContent = file.name; $('#file-meta').textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB · ${file.type || 'formato detectado'}`; $('#file-card').classList.remove('hidden');
    applySettings();
  } catch (err) { releaseMedia(state); resetView(); notice(err.message || 'No se pudo abrir el archivo. Intenta con otro.'); }
}
document.querySelectorAll('.module').forEach(button => button.addEventListener('click', () => setModule(button.dataset.module)));
$('#choose-file').addEventListener('click', () => $('#file-input').click()); $('#replace-file').addEventListener('click', () => $('#file-input').click());
$('#file-input').addEventListener('change', e => { importFile(e.target.files[0]); });
const drop = $('#drop-zone');
drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('dragover'); importFile(e.dataTransfer.files[0]); });
$('#reset-button').addEventListener('click', resetSettings);
$('#play-button').addEventListener('click', async () => { if (!state.media) return; if (state.media.paused) { try { await state.media.play(); } catch { notice('El navegador bloqueó la reproducción. Pulsa reproducir de nuevo para autorizarla.'); } } else state.media.pause(); });
$('#seek').addEventListener('input', e => { if (state.media?.duration) { state.media.currentTime = Number(e.target.value) / 1000 * state.media.duration; document.querySelectorAll('.eye-view video').forEach(v => { v.currentTime = state.media.currentTime; }); } });
$('#back-button').addEventListener('click', () => { if (state.media) state.media.currentTime = Math.max(0, state.media.currentTime - 10); });
$('#forward-button').addEventListener('click', () => { if (state.media) state.media.currentTime = Math.min(state.media.duration || Infinity, state.media.currentTime + 10); });
$('#volume').addEventListener('input', e => { if (state.media) state.media.volume = Number(e.target.value); });
$('#fullscreen-button').addEventListener('click', async () => { try { await $('#viewer').requestFullscreen(); } catch { notice('Pantalla completa no está disponible en este navegador.'); } });
$('#vr-button').addEventListener('click', () => { if (!state.file || state.module === 'anaglyph') return; state.vr = true; $('#viewer').classList.add('vr-active'); $('#visual').classList.add('is-vr'); $('#vr-exit').classList.remove('hidden'); $('#orientation-warning').classList.remove('hidden'); document.body.classList.add('viewer-mode'); });
$('#exit-vr').addEventListener('click', () => { state.vr = false; $('#viewer').classList.remove('vr-active'); $('#visual').classList.remove('is-vr'); $('#vr-exit').classList.add('hidden'); $('#orientation-warning').classList.add('hidden'); document.body.classList.remove('viewer-mode'); });
window.addEventListener('orientationchange', () => { if (state.vr && screen.orientation?.type?.startsWith('landscape')) $('#orientation-warning').classList.add('hidden'); else if (state.vr) $('#orientation-warning').classList.remove('hidden'); });
renderControls(state.module);
$('#anaglyph-source').addEventListener('change', updateAnaglyphSource);
updateAnaglyphSource();
