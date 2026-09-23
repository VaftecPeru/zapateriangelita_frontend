import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
mkdirSync('node_modules/.cache/angelita', { recursive: true });
for (const name of ['storefront', 'customer-session', 'ubigeo', 'checkout-address']) {
await build({
  entryPoints: [`tests/${name}.test.tsx`], bundle: true, platform: 'node', format: 'cjs',
  packages: 'external', outfile: `node_modules/.cache/angelita/${name}-tests.cjs`,
  loader: { '.css': 'empty', '.jpg': 'dataurl', '.png': 'dataurl' },
  define: { 'import.meta.env': '{}' }, jsx: 'automatic',
});
const result = spawnSync(process.execPath, [`node_modules/.cache/angelita/${name}-tests.cjs`], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
}
