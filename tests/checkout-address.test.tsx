import assert from 'node:assert/strict';
import {
  getSuggestedCity,
  isValidColony,
  isValidMexicoPostalCode,
} from '../src/utils/checkoutAddress';

assert.equal(
  getSuggestedCity(['Ciudad Hidalgo'], ''),
  'Ciudad Hidalgo',
  'Debe sugerir Ciudad Hidalgo cuando es la única cabecera',
);
assert.equal(
  getSuggestedCity(['Ciudad Hidalgo'], 'Otra localidad'),
  null,
  'No debe sobrescribir una localidad escrita por el cliente',
);
assert.equal(
  getSuggestedCity(['Cabecera A', 'Cabecera B'], ''),
  null,
  'No debe elegir automáticamente cuando hay más de una opción',
);
assert.equal(isValidMexicoPostalCode('61100'), true);
assert.equal(isValidMexicoPostalCode('6110'), false);
assert.equal(isValidMexicoPostalCode('611000'), false);
assert.equal(isValidColony('Centro'), true);
assert.equal(isValidColony(' '), false);

console.log('PASS Checkout México: ciudad sugerida, código postal y colonia');
