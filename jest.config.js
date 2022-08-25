/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  // moduleDirectories: [
  //   // "<rootDir>/src",
  //   // "<rootDir>/tst",
  //   "node_modules"
  // ],
  // preset: 'ts-jest',
  // testEnvironment: 'node',
  transform: {
    "^.+\\.tsx?$": [ 
      "esbuild-jest", { 
        sourcemap: true,
        // loaders: {
        //   '.spec.ts': 'tsx'
        // }
      } 
    ]
  },
  verbose: true
};