const isString = str => typeof str === 'string'

const checkIgnoreDepth = ({ ignorePrefix, path } = {}) => {
  if (!isString(ignorePrefix) || !isString(path)) return false

  const ignoreArray = ignorePrefix.split('../')
  const pathArray = path.split('../')

  return ignoreArray.length === pathArray.length
}

module.exports = checkIgnoreDepth
