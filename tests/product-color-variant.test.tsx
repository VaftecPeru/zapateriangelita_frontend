import assert from 'node:assert/strict';
import {
  getActiveColorImages,
  getColorVariantValue,
  normalizeColorVariantKey,
} from '../src/utils/colorVariantLookup';

assert.equal(normalizeColorVariantKey('  MARRÓN  '), 'marron');
assert.deepEqual(
  getColorVariantValue({ Negro: ['black.webp'], 'Marrón': ['brown.webp'] }, 'Marron'),
  ['brown.webp'],
);
assert.deepEqual(
  getActiveColorImages(
    { Negro: ['black.webp'], 'Marrón': ['brown.webp'] },
    'MARRON',
    ['general.webp'],
  ),
  ['brown.webp'],
);
assert.deepEqual(
  getActiveColorImages({ Negro: ['black.webp'] }, 'Marron', ['general.webp']),
  [],
  'do not show the black shoe when the selected brown variant has no image',
);
assert.deepEqual(
  getActiveColorImages({}, 'Marron', ['legacy-general.webp']),
  ['legacy-general.webp'],
  'legacy products without per-color image configuration keep their general gallery',
);
console.log('product-color-variant: all assertions passed');
