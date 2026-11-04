import { state, defaults } from './state.js';
const range = (id, label, key, min, max, step, unit, left, right) => `<div class="control-group"><label class="control-label" for="${id}"><span>${label}</span><output id="${id}-value">${state.settings[key]}${unit}</output></label><input class="range-control" id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${state.settings[key]}" data-setting="${key}"><div class="range-scale"><span>${left}</span><span>${right}</span></div></div>`;
const toggle = (id, label, key) => `<div class="control-group"><label class="toggle-row" for="${id}">${label}<input class="toggle" id="${id}" type="checkbox" data-setting="${key}" ${state.settings[key] ? 'checked' : ''}></label></div>`;
export function renderControls(module) {
  const host = document.querySelector('#controls');
  host.innerHTML = module === 'anaglyph'
    ? range('zoom','Escala','zoom',50,200,1,'%', '50%', '200%') + range('brightness','Brillo','brightness',50,150,1,'%', '50%', '150%') + range('contrast','Contraste','contrast',50,200,1,'%', '50%', '200%')
    : range('offset','Convergencia horizontal','offset',-24,24,1,' px','Separar','Acercar') + range('vertical','Alineación vertical','vertical',-20,20,1,' px','−20 px','+20 px') + range('zoom','Escala','zoom',75,125,1,'%', '75%', '125%') + toggle('swap','Intercambiar ojos','swap');
  host.querySelectorAll('[data-setting]').forEach(el => el.addEventListener('input', () => {
    const key = el.dataset.setting; state.settings[key] = el.type === 'checkbox' ? el.checked : Number(el.value);
    const output = document.querySelector(`#${el.id}-value`); if (output) output.value = `${state.settings[key]}${key === 'offset' || key === 'vertical' ? ' px' : '%'}`;
    applySettings();
  }));
}
export function setControlsEnabled(enabled) {
  document.querySelectorAll('#controls [data-setting]').forEach(control => { control.disabled = !enabled; });
}
export function applySettings() {
  const visual = document.querySelector('#visual'), s = state.settings;
  const image = visual.querySelector('.anaglyph-image');
  if (image) { image.style.setProperty('--zoom', s.zoom / 100); image.style.setProperty('--image-filter', `brightness(${s.brightness}%) contrast(${s.contrast}%)`); }
  const pair = visual.querySelector('.stereo-pair');
  if (pair) {
    const left = pair.querySelector('.eye-view.left'), right = pair.querySelector('.eye-view.right');
    pair.style.transform = `scale(${s.zoom / 100})`;
    [left, right].forEach((eye, index) => {
      eye.style.transform = '';
      const media = eye?.querySelector('img,video,canvas');
      media?.style.setProperty('--eye-shift-x', `${(index ? -1 : 1) * s.offset / 2}px`);
      media?.style.setProperty('--eye-shift-y', `${s.vertical}px`);
    });
    if (left && right) { left.style.order = s.swap ? '2' : '1'; right.style.order = s.swap ? '1' : '2'; }
  }
}
export function resetSettings() { state.settings = { ...defaults }; renderControls(state.module); applySettings(); }
