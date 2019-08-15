const getProperties = (options) => {
  if (!options && !options.length) return {}

  const [ first = {} ] = options
  return first
}

module.exports = getProperties
