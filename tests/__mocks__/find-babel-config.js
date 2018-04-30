const findBabelConfig = jest.genMockFromModule('find-babel-config')

findBabelConfig.sync = () => ({
  config: require('../babelrc'),
})

module.exports = findBabelConfig
