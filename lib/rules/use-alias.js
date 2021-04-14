const babel = require('@babel/core')
const path = require('path')
const fs = require('fs')

const checkIgnoreDepth = require('../helpers/check-ignore-depth')
const findProjectRoot = require('../helpers/find-project-root')
const getProperties = require('../helpers/get-properties')

const checkPath = (path, ext) => fs.existsSync(`${path}${ext}`) || fs.existsSync(`${path}/index${ext}`)

module.exports = {
  meta: {
    docs: {
      description: 'Warn when using relative paths to modules aliased',
      category: 'Fill me in',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          ignoreDepth: {
            type: 'integer',
            minimum: 0,
          },
          allowDepthMoreOrLessThanEquality: {
            type: 'boolean',
          },
          projectRoot: {
            type: 'string',
          },
          extensions: {
            type: 'array',
            uniqueItems: true,
            items: {
              type: 'string',
              enum: ['.ts', '.tsx', '.jsx'],
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create: function (context) {
    const filename = context.getFilename()
    const filePath = path.dirname(filename)

    // Plugin options.
    const options = getProperties(context.options)
    const projectRootAbsolutePath = findProjectRoot(filePath, options.projectRoot)

    // Find alias via babel-plugin-module-resolver config.
    let alias = {}
    // Look for default babel.config file
    let configOptions = babel.loadPartialConfig().options
    // No plugins found, look for .babelrc config file
    if (configOptions.plugins.length === 0) {
      configOptions = babel.loadPartialConfig({
        configFile: './.babelrc',
      }).options
    }

    try {
      const validPluginNames = new Set(['babel-plugin-module-resolver', 'module-resolver'])
      const [moduleResolver] = configOptions.plugins.filter((plugin) => {
        if (validPluginNames.has(plugin.file && plugin.file.request)) {
          return plugin
        }
      })
      alias = { ...moduleResolver.options.alias }
    } catch (error) {
      const message = 'Unable to find config for babel-plugin-module-resolver'
      return {
        ImportDeclaration(node) {
          context.report({ node, message, loc: node.source.loc })
        },
        CallExpression(node) {
          context.report({ node, message, loc: node.arguments[0].loc })
        },
      }
    }

    // Resolve alias paths.
    const cwd = projectRootAbsolutePath || process.cwd()
    for (const name in alias) {
      alias[name] = path.join(cwd, alias[name])
    }

    const run = ({ node, source }) => {
      const val = source.value
      if (!val) return false // template literals will have undefined val

      const { ignoreDepth, projectRoot, extensions, allowDepthMoreOrLessThanEquality } = options

      // Ignore if directory depth matches options.
      if (checkIgnoreDepth({ ignoreDepth, path: val, allowDepthMoreOrLessThanEquality })) return false

      // Error if projectRoot option specified but cannot be resolved.
      if (projectRoot && !projectRootAbsolutePath) {
        return context.report({
          node,
          message: 'Invalid project root specified',
          loc: source.loc,
        })
      }

      const containedAlias = Object.keys(alias).find((alias) => val.startsWith(alias)) //new Regex(`^${alias}(\\/|$)`).test(val))
      const resolvedPath = containedAlias
        ? val.replace(containedAlias, alias[containedAlias])
        : path.resolve(filePath, val)
      const [insideAlias] =
        Object.entries(alias).find(([aliasName, aliasPath]) => resolvedPath.startsWith(aliasPath)) || []
      const resolvedExt = path.extname(val) ? '' : '.js'
      const isSubpath = resolvedPath.startsWith(filePath)

      let pathExists = checkPath(resolvedPath, resolvedExt)

      if (extensions && !pathExists) {
        pathExists = extensions.filter((ext) => checkPath(resolvedPath, ext)).length
      }

      if (insideAlias && pathExists && val.match(/\.\.\//)) {
        // matches, exists, and starts with ../,
        const newPath = resolvedPath.replace(alias[insideAlias], '')
        const replacement = path.join(insideAlias, newPath).replace(/\\/g, '/')
        context.report({
          node,
          message: 'Do not use relative path for aliased modules',
          loc: source.loc,
          fix: (fixer) => fixer.replaceTextRange([source.range[0] + 1, source.range[1] - 1], replacement),
        })
      } else if (containedAlias && isSubpath) {
        const replacement = `./${path.relative(filePath, resolvedPath)}`
        context.report({
          node,
          message: 'Do not use aliased path for subpath import',
          loc: source.loc,
          fix: (fixer) => fixer.replaceTextRange([source.range[0] + 1, source.range[1] - 1], replacement),
        })
      }
    }

    return {
      ImportDeclaration(node) {
        run({ node, source: node.source })
      },
      CallExpression(node) {
        const val = node.callee.name || node.callee.type
        if (val === 'Import' || val === 'require') {
          run({ node, source: node.arguments[0] })
        }
      },
      ImportExpression(node) {
        // dynamic import was erroneously using visitorKey for
        // call expressions https://github.com/babel/babel/pull/10828
        // adding ImportExpression for new versions of @babel/eslint-parser
        run({ node, source: node.source })
      },
    }
  },
}
