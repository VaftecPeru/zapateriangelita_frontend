import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const INEGI_BASE = 'https://gaia.inegi.org.mx/wscatgeo/v2';
const LOCAL_PATH = 'public/data/mexico-ubigeo.json';

const stateAliases = new Map([
  ['Coahuila de Zaragoza', 'Coahuila'],
  ['México', 'Estado de México'],
  ['Michoacán de Ocampo', 'Michoacán'],
  ['Veracruz de Ignacio de la Llave', 'Veracruz'],
]);

const normalize = (value) =>
  String(value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(700 * attempt);
    }
  }
  throw new Error(`No se pudo consultar INEGI: ${url}. ${lastError}`);
}

const catalog = JSON.parse(readFileSync(LOCAL_PATH, 'utf8'));
const localStates = Object.keys(catalog);
assert.equal(localStates.length, 32, 'El snapshot local debe tener 32 entidades');

const localByCode = new Map();
for (const [state, entries] of Object.entries(catalog)) {
  assert.ok(Array.isArray(entries), `${state} debe contener un arreglo de municipios`);
  for (const entry of entries) {
    assert.match(entry.code, /^\d{5}$/);
    assert.ok(!localByCode.has(entry.code), `Clave INEGI duplicada: ${entry.code}`);
    localByCode.set(entry.code, {
      state: normalize(state),
      name: normalize(entry.name),
      head: normalize(entry.head),
    });
  }
}

const statesResponse = await fetchJson(`${INEGI_BASE}/mgee/`);
const officialStates = statesResponse?.datos ?? [];
assert.equal(officialStates.length, 32, 'INEGI debe reportar 32 entidades');

const officialByCode = new Map();
const stateCounts = [];

for (const state of officialStates) {
  const stateCode = String(state.cve_ent).padStart(2, '0');
  const officialStateName = normalize(state.nomgeo);
  const localStateName = stateAliases.get(officialStateName) ?? officialStateName;

  assert.ok(
    Object.prototype.hasOwnProperty.call(catalog, localStateName),
    `Falta entidad en snapshot: ${localStateName} (${stateCode})`,
  );

  const response = await fetchJson(`${INEGI_BASE}/mgem/${stateCode}`);
  const municipalities = response?.datos ?? [];
  stateCounts.push([localStateName, municipalities.length]);

  for (const municipality of municipalities) {
    const code = String(municipality.cvegeo ?? `${stateCode}${municipality.cve_mun}`).padStart(5, '0');
    const name = normalize(municipality.nomgeo);
    const head = normalize(municipality.nom_cab);

    assert.ok(!officialByCode.has(code), `INEGI devolvió clave duplicada: ${code}`);
    officialByCode.set(code, { state: localStateName, name, head });
  }
}

assert.equal(
  localByCode.size,
  officialByCode.size,
  `Cantidad de municipios distinta: local=${localByCode.size}, INEGI=${officialByCode.size}`,
);

const errors = [];

for (const [code, official] of officialByCode) {
  const local = localByCode.get(code);
  if (!local) {
    errors.push(`Falta ${code}: ${official.state} > ${official.name}`);
    continue;
  }
  if (local.state !== official.state) {
    errors.push(`${code}: entidad local="${local.state}" INEGI="${official.state}"`);
  }
  if (local.name !== official.name) {
    errors.push(`${code}: municipio local="${local.name}" INEGI="${official.name}"`);
  }
  // INEGI no siempre llena nom_cab en la respuesta agregada. Cuando sí lo
  // entrega, también verificamos la cabecera municipal del snapshot.
  if (official.head && local.head !== official.head) {
    errors.push(`${code}: cabecera local="${local.head}" INEGI="${official.head}"`);
  }
}

for (const code of localByCode.keys()) {
  if (!officialByCode.has(code)) {
    const local = localByCode.get(code);
    errors.push(`Registro local inexistente en INEGI ${code}: ${local.state} > ${local.name}`);
  }
}

if (errors.length) {
  console.error('\nDiferencias contra INEGI:');
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  if (errors.length > 100) console.error(`... y ${errors.length - 100} diferencias adicionales`);
  process.exit(1);
}

console.log(`PASS INEGI: ${officialStates.length} entidades y ${officialByCode.size} municipios/demarcaciones coinciden con el snapshot local.`);
console.log(
  'Cobertura por entidad:',
  stateCounts.map(([state, count]) => `${state}=${count}`).join(', '),
);
