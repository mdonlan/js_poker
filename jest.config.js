/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  // preset: 'ts-jest',
  // testEnvironment: 'node',
  transform: {
    "^.+\\.tsx?$": "esbuild-jest"
  },
  verbose: true
};