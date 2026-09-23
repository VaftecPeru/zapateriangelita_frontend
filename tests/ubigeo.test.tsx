import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

type MunicipalityEntry = { code: string; name: string; head: string };
type Catalog = Record<string, MunicipalityEntry[]>;

const ubigeo = JSON.parse(
  readFileSync('public/data/mexico-ubigeo.json', 'utf8'),
) as Catalog;

const states = Object.keys(ubigeo);
const municipalities = Object.values(ubigeo).flat();
const codes = municipalities.map((entry) => entry.code);

assert.equal(states.length, 32, 'México debe contener sus 32 entidades federativas');
assert.equal(
  municipalities.length,
  2478,
  'El snapshot debe contener 2,478 municipios y demarcaciones territoriales',
);
assert.equal(new Set(codes).size, codes.length, 'Cada clave INEGI municipal debe ser única');

for (const [state, entries] of Object.entries(ubigeo)) {
  assert.ok(entries.length > 0, `${state} debe contener municipios`);
  for (const entry of entries) {
    assert.match(entry.code, /^\\d{5}$/, `Clave INEGI inválida: ${entry.code}`);
    assert.ok(entry.name.trim(), `Municipio sin nombre: ${entry.code}`);
    assert.ok(entry.head.trim(), `Municipio sin cabecera: ${entry.code}`);
  }
}

assert.equal(ubigeo['Oaxaca'].length, 570, 'Oaxaca debe conservar sus 570 municipios');
assert.equal(ubigeo['Zacatecas'].length, 58, 'Zacatecas debe estar incluido completo');

const hidalgo = ubigeo['Michoacán'].find((entry) => entry.name === 'Hidalgo');
assert.equal(hidalgo?.head, 'Ciudad Hidalgo', 'Debe existir Michoacán > Hidalgo > Ciudad Hidalgo');

const sanJuanMixtepec = ubigeo['Oaxaca'].filter((entry) => entry.name === 'San Juan Mixtepec');
assert.equal(sanJuanMixtepec.length, 2, 'No se deben perder municipios homónimos de Oaxaca');
assert.deepEqual(
  sanJuanMixtepec.map((entry) => entry.head).sort(),
  ['San Juan Mixtepec Distrito 08', 'San Juan Mixtepec Distrito 26'].sort(),
);

const sanPedroMixtepec = ubigeo['Oaxaca'].filter((entry) => entry.name === 'San Pedro Mixtepec');
assert.equal(sanPedroMixtepec.length, 2, 'No se deben perder municipios homónimos de Oaxaca');

console.log('PASS Ubigeo: 32 entidades, 2,478 municipios y casos homónimos auditados');
