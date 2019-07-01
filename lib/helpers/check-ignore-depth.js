const isString = str => typeof str === 'string'

const checkIgnoreDepth = ({ ignoreDepth, path } = {}) => {
  if (!isString(ignoreDepth) || !isString(path)) return false

  const ignoreArray = ignoreDepth.split('../')
  const pathArray = path.split('../')

  return ignoreArray.length === pathArray.length
}

module.exports = checkIgnoreDepth
