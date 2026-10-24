export function normalizeColorVariantKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX");
}

export function getColorVariantValue<T>(
  values: Record<string, T> | null | undefined,
  selectedColor: unknown,
): T | undefined {
  const selectedKey = normalizeColorVariantKey(selectedColor);
  if (!selectedKey || !values) return undefined;

  return Object.entries(values).find(
    ([color]) => normalizeColorVariantKey(color) === selectedKey,
  )?.[1];
}

/**
 * Never present another color's photo as the selected variant.
 * If the product has per-color images but this color has none, return an
 * empty list so the UI can clearly request the missing photo. Legacy products
 * with no per-color image configuration continue using their general gallery.
 */
export function getActiveColorImages<T>(
  colorImages: Record<string, T[]> | null | undefined,
  selectedColor: string | null | undefined,
  fallbackImages: T[],
): T[] {
  if (!selectedColor) return fallbackImages;

  const selectedImages = getColorVariantValue(colorImages, selectedColor);
  if (Array.isArray(selectedImages) && selectedImages.length > 0) {
    return selectedImages;
  }

  const hasConfiguredColorImages = Object.values(colorImages ?? {}).some(
    (images) => Array.isArray(images) && images.length > 0,
  );

  return hasConfiguredColorImages ? [] : fallbackImages;
}
