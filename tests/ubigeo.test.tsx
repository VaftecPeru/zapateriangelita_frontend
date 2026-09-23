import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ubigeo = JSON.parse(readFileSync('public/data/mexico-ubigeo.json', 'utf8'));

assert.ok(ubigeo['Michoacán'], 'Debe existir el estado Michoacán');
assert.ok(ubigeo['Michoacán']['Hidalgo'], 'Michoacán debe incluir el municipio Hidalgo');
assert.ok(
  ubigeo['Michoacán']['Hidalgo'].includes('Ciudad Hidalgo'),
  'El municipio Hidalgo debe incluir Ciudad Hidalgo',
);

console.log('PASS Ubigeo: Michoacán > Hidalgo > Ciudad Hidalgo');
