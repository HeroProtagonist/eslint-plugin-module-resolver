const path = require('path')
const isAliasedPath = require('../helpers/is-aliased-path')

const entries = Object.entries || ((obj) => Object.keys(obj).map((key) => [key, obj[key]]))

const createFixer = (options = {}) => {
  const { alias, filePath, cwd, node = {} } = options

  let source = node.source // ImportDeclaration or ImportExpression
  if (Array.isArray(node.arguments)) {
    source = node.arguments[0] // CallExpression
  }

  if (!source) return null

  const aliasPaths = entries(alias).map(([key, value]) => [key, path.join(cwd, value)])
  const resolvedPath = path.resolve(filePath, source.value)
  const [aliasMatch, aliasPath] = aliasPaths.find(([_, aliasPath]) =>
    isAliasedPath(resolvedPath, aliasPath)
  ) || [];

  if (!aliasMatch || !aliasPath) return null

  const newPath = resolvedPath.replace(aliasPath, '')

  const replacement = path.normalize(path.join(aliasMatch, newPath))

  return (fixer) => fixer.replaceTextRange([source.range[0] + 1, source.range[1] - 1], replacement)
}

module.exports = createFixer
