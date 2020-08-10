const path = require('path')

const createFixer = (options = {}) => {
  const { alias, filePath, cwd, node = {} } = options

  let source = node.source // ImportDeclaration or ImportExpression
  if (Array.isArray(node.arguments)) {
    source = node.arguments[0] // CallExpression
  }

  if (!source) return null

  const aliasPaths = Object.entries(alias).map(([key, value]) => [key, path.join(cwd, value)])
  const resolvedPath = path.resolve(filePath, source.value)
  const [aliasMatch, aliasPath] = aliasPaths.find(([_, aliasPath]) => resolvedPath.includes(aliasPath)) || []

  if (!aliasMatch || !aliasPath) return null

  const newPath = resolvedPath.replace(aliasPath, '')

  const replacement = path.join(aliasMatch, newPath)

  return (fixer) => fixer.replaceTextRange([source.range[0] + 1, source.range[1] - 1], replacement)
}

module.exports = createFixer
