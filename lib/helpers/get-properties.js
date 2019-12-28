const getProperties = (options = []) => {
  if (!options || !Array.isArray(options)) return {}

  const [first = {}] = options
  return first
}

module.exports = getProperties
