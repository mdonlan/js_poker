const { build } = require('esbuild')

build({
  entryPoints: ['src/index.ts'],
//   outdir: 'dist',
    outfile: "./dist/bundle.js",
  bundle: true,
})