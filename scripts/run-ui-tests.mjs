import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

mkdirSync('node_modules/.cache/angelita', { recursive: true });

const suites = [
  ['tests/storefront.test.tsx', 'storefront-tests.cjs'],
  ['tests/openpay.test.tsx', 'openpay-tests.cjs'],
];

for (const [entryPoint, output] of suites) {
  const outfile = `node_modules/.cache/angelita/${output}`;

  await build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    outfile,
    loader: { '.css': 'empty', '.jpg': 'dataurl', '.png': 'dataurl' },
    define: { 'import.meta.env': '{}' },
    jsx: 'automatic',
  });

  const result = spawnSync(process.execPath, [outfile], { stdio: 'inherit' });
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
}
