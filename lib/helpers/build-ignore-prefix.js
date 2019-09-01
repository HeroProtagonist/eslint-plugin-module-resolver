function buildIgnorePrefix(ignoreDepth) {
  if (!ignoreDepth || isNaN(ignoreDepth)) {
    return null
  }

  return Array(ignoreDepth)
    .fill('../')
    .join('')
}

module.exports = buildIgnorePrefix
