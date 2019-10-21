const path = require('path')
const isString = str => typeof str === 'string'

const checkIgnoreDepth = ({ ignoreDepth, path: pathInput } = {}) => {
  if (!ignoreDepth || !isString(pathInput)) return false

  const pathArray = path.normalize(pathInput).split(path.sep)
  const doubleDotsNumber = pathArray.findIndex(pathPart => pathPart !== '..')

  return ignoreDepth === doubleDotsNumber
}

module.exports = checkIgnoreDepth
