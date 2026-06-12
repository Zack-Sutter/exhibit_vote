export function extractEdgeColor(img: HTMLImageElement): string | null {
  try {
    const width = 64;
    const height = Math.max(
      1,
      Math.round((img.naturalHeight / img.naturalWidth) * width),
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    const sample = (x: number, y: number) => {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      if (alpha < 128) return;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count += 1;
    };

    for (let x = 0; x < width; x += 1) {
      sample(x, 0);
      sample(x, height - 1);
    }
    for (let y = 0; y < height; y += 1) {
      sample(0, y);
      sample(width - 1, y);
    }

    if (count === 0) return null;

    return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
  } catch {
    return null;
  }
}
