const path = require('path')

const createFixer = ({alias, filePath, cwd, node} ) => {
  let source = node.source // ImportDeclaration
  if (Array.isArray(node.arguments)) {
    source = node.arguments[0] // CallExpression
  }

  const aliasPaths = Object.entries(alias).map(([key, value]) => [key, path.join(cwd, value)])
  const resolvedPath = path.resolve(filePath, source.value)
  const [aliasMatch, aliasPath] = aliasPaths.find(([_, aliasPath]) => resolvedPath.includes(aliasPath)) || []

  if (!aliasMatch || !aliasPath) return

  const newPath = resolvedPath.replace(aliasPath, '')

  const replacement = path.join(aliasMatch, newPath)

  return fixer => fixer.replaceTextRange([source.start + 1, source.end - 1], replacement)
}

module.exports = createFixer
