let config = {}

if (process.env.COLLECT_COVERAGE) {
  config = {
    ...config,
    coverageDirectory: './coverage/',
    collectCoverage: true,
  }
}

module.exports = config
