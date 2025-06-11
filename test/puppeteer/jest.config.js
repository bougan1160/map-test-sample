module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/puppeteer/**/*.test.js'],
  verbose: true,
  testTimeout: 30000, // Increase timeout for browser tests
};