import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
mkdirSync('node_modules/.cache/angelita', { recursive: true });
await build({
  entryPoints: ['tests/storefront.test.tsx'], bundle: true, platform: 'node', format: 'cjs',
  packages: 'external', outfile: 'node_modules/.cache/angelita/storefront-tests.cjs',
  loader: { '.css': 'empty', '.jpg': 'dataurl', '.png': 'dataurl' },
  define: { 'import.meta.env': '{}' }, jsx: 'automatic',
});
const result = spawnSync(process.execPath, ['node_modules/.cache/angelita/storefront-tests.cjs'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
