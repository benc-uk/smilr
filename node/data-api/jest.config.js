module.exports = {
  testEnvironment: 'node',
  verbose: true,
  silent: true,
  collectCoverage: true,
  coverageDirectory: '.',
  coverageReporters: ['text', 'cobertura'],
  reporters: [
    'default', [
      'jest-junit', {
        outputName: 'unit-tests-data-api.xml',
        outputDirectory: '.'
      }
    ]
  ]
}