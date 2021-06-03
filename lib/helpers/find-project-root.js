const path = require('path')

const isString = (str) => typeof str === 'string'

function findProjectRoot(filePath = '', projectRoot = '') {
  if (!filePath || !isString(filePath) || !projectRoot || !isString(projectRoot)) {
    return null
  }

  const normalizedFilePath = path.normalize(filePath)
  const normalizedProjectRoot = path
    .normalize(projectRoot)
    // remove leading ["../", "./". "/"] or multiples of (e.g. "../../")
    .replace(/^(\.\.\/)+|^(\.\.\\)+|^(\.\/)+|^(\.\\)+|^(\/)+|^(\\)+/, '')
    // remove trailing slash(s)
    .replace(/(\/)+$|(\\)+$/, '')

  if (normalizedFilePath.includes(normalizedProjectRoot)) {
    const [workspaceRoot] = normalizedFilePath.split(normalizedProjectRoot)
    return `${workspaceRoot}${normalizedProjectRoot}`
  }

  return null
}

module.exports = findProjectRoot
