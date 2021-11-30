const { build } = require('esbuild')

build({
  entryPoints: ['src/index.ts'],
//   outdir: 'dist',
    outfile: "./dist/bundle.js",
  bundle: true,
  
//   watch: {
//     onRebuild(error, result) {
//       if (error) console.error('watch build failed:', error)
//       else console.log('watch build succeeded:', result)
//     },
//   },
}).then(() => {
    console.log("esbuild -- completed build")
})
