const STRIP_HEIGHT = 128;

export function convertToAnaglyph(image, { source = '2d', separation = null } = {}) {
  const stereoPair = source === 'sbs';
  const width = stereoPair ? Math.floor(image.naturalWidth / 2) : image.naturalWidth;
  const height = image.naturalHeight;
  const channelShift = separation ?? Math.max(3, Math.min(12, Math.round(width * 0.005)));
  if (width < 1 || height < 1) throw new Error('La imagen no tiene dimensiones válidas para convertirla.');

  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const outputContext = output.getContext('2d');
  const leftCanvas = document.createElement('canvas');
  const rightCanvas = document.createElement('canvas');
  leftCanvas.width = rightCanvas.width = width;
  leftCanvas.height = rightCanvas.height = Math.min(STRIP_HEIGHT, height);
  const leftContext = leftCanvas.getContext('2d', { willReadFrequently: true });
  const rightContext = rightCanvas.getContext('2d', { willReadFrequently: true });
  if (!outputContext || !leftContext || !rightContext) throw new Error('El navegador no pudo preparar la conversión. Intenta con una imagen más pequeña.');

  for (let y = 0; y < height; y += STRIP_HEIGHT) {
    const stripHeight = Math.min(STRIP_HEIGHT, height - y);
    leftContext.clearRect(0, 0, width, stripHeight);
    rightContext.clearRect(0, 0, width, stripHeight);
    if (stereoPair) {
      leftContext.drawImage(image, 0, y, width, stripHeight, 0, 0, width, stripHeight);
      rightContext.drawImage(image, image.naturalWidth - width, y, width, stripHeight, 0, 0, width, stripHeight);
    } else {
      leftContext.drawImage(image, 0, y, width, stripHeight, -channelShift, 0, width, stripHeight);
      rightContext.drawImage(image, 0, y, width, stripHeight, channelShift, 0, width, stripHeight);
    }

    const left = leftContext.getImageData(0, 0, width, stripHeight).data;
    const right = rightContext.getImageData(0, 0, width, stripHeight).data;
    const anaglyph = outputContext.createImageData(width, stripHeight);
    for (let i = 0; i < left.length; i += 4) {
      anaglyph.data[i] = left[i];
      anaglyph.data[i + 1] = right[i + 1];
      anaglyph.data[i + 2] = right[i + 2];
      anaglyph.data[i + 3] = Math.max(left[i + 3], right[i + 3]);
    }
    outputContext.putImageData(anaglyph, 0, y);
  }
  return output;
}
