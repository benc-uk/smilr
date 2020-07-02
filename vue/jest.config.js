module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/no-babel',
  setupFiles: ['<rootDir>/tests/unit/jest.init.js'],
  verbose: true,
  silent: true,
  collectCoverage: true,
  //coverageDirectory: '../../output/web-coverage',
  coverageReporters: ['html', 'text-summary'],
  reporters: [
    'default', [
      'jest-junit', {
        outputName: 'unit-tests-frontend.xml',
        //outputDirectory: '../../output'
      }
    ]
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!epic-spinners)'
  ]
}
