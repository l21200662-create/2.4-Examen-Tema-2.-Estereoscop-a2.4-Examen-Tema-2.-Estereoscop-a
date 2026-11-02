export function validateFile(file, module) {
  const image = /^image\/(jpeg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
  const video = file.type === 'video/mp4' || /\.mp4$/i.test(file.name);
  if (module === 'video' && !video) return 'Este módulo acepta videos MP4. Selecciona un archivo .mp4 compatible.';
  if (module !== 'video' && !image) return 'Este módulo acepta imágenes JPG, PNG o WebP. Elige un archivo compatible.';
  if (!file.size) return 'El archivo está vacío. Selecciona otro archivo.';
  return '';
}
export function loadImage(url) {
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('No se pudo decodificar esta imagen. Prueba con otro JPG, PNG o WebP.')); img.src = url; });
}
export function releaseMedia(state) {
  cancelAnimationFrame(state.raf);
  if (state.media) { state.media.pause?.(); state.media.removeAttribute?.('src'); state.media.load?.(); }
  document.querySelectorAll('.eye-view video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
  if (state.url) URL.revokeObjectURL(state.url);
  state.file = null; state.url = null; state.media = null; state.width = 0; state.height = 0;
}
