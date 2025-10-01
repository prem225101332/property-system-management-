export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'mjs'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.mjs'], // note: .mjs
  transform: {},   // no Babel; native ESM
  verbose: true,
};