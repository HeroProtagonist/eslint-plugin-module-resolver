const babel = require('@babel/core')
const path = require('path')
const fs = require('fs')

const checkIgnoreDepth = require('../helpers/check-ignore-depth')
const findProjectRoot = require('../helpers/find-project-root')
const getProperties = require('../helpers/get-properties')
const createFixer = require('../helpers/create-fixer')

const values = Object.values || ((obj) => Object.keys(obj).map((e) => obj[e]))
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
    const partialConfig = babel.loadPartialConfig()
    const configOptions = partialConfig.options
    try {
      const validPluginNames = new Set(['babel-plugin-module-resolver', 'module-resolver'])
      const [moduleResolver] = configOptions.plugins.filter(plugin => {
        if (validPluginNames.has(plugin.file && plugin.file.request)) {
          return plugin
        }
      })
      alias = moduleResolver.options.alias || {}
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

    // Build array of alias paths.
    const cwd = projectRootAbsolutePath || process.cwd()
    const aliasPaths = values(alias).map((a) => path.join(cwd, a))

    const hasError = (val) => {
      if (!val) return false // template literals will have undefined val

      const { ignoreDepth, projectRoot, extensions, allowDepthMoreOrLessThanEquality } = options

      // Ignore if directory depth matches options.
      if (checkIgnoreDepth({ ignoreDepth, path: val, allowDepthMoreOrLessThanEquality })) return false

      // Error if projectRoot option specified but cannot be resolved.
      if (projectRoot && !projectRootAbsolutePath) {
        return {
          suggestFix: false,
          message: 'Invalid project root specified',
        }
      }

      const resolvedPath = path.resolve(filePath, val)
      const resolvedExt = path.extname(val) ? '' : '.js'

      let pathExists = checkPath(resolvedPath, resolvedExt)

      if (extensions && !pathExists) {
        pathExists = extensions.filter((ext) => checkPath(resolvedPath, ext)).length
      }

      const isAliased = aliasPaths.some((aliasPath) => resolvedPath.includes(aliasPath))

      const error = isAliased && pathExists && val.match(/\.\.\//) // matches, exists, and starts with ../,
      return error && { suggestFix: true, message: 'Do not use relative path for aliased modules' }
    }

    const reportError = ({ node, source, error }) => {
      context.report({
        node,
        message: error.message,
        loc: source.loc,
        fix: error.suggestFix && createFixer({ alias, filePath, cwd, node }),
      })
    }

    return {
      ImportDeclaration(node) {
        const error = hasError(node.source.value)
        if (error) {
          reportError({ node, source: node.source, error })
        }
      },
      CallExpression(node) {
        const val = node.callee.name || node.callee.type
        if (val === 'Import' || val === 'require') {
          const error = hasError(node.arguments[0].value)
          error && reportError({ node, source: node.arguments[0], error })
        }
      },
      ImportExpression(node) {
        // dynamic import was erroneously using visitorKey for
        // call expressions https://github.com/babel/babel/pull/10828
        // adding ImportExpression for new versions of @babel/eslint-parser
        const error = hasError(node.source.value)
        if (error) {
          reportError({ node, source: node.source, error })
        }
      },
    }
  },
}
