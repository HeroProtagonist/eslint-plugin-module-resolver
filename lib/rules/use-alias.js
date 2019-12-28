const findBabelConfig = require('find-babel-config')
const path = require('path')
const fs = require('fs')

const checkIgnoreDepth = require('../helpers/check-ignore-depth')
const findProjectRoot = require('../helpers/find-project-root')
const getProperties = require('../helpers/get-properties')

const values = Object.values || (obj => Object.keys(obj).map(e => obj[e]))
const checkPath = (path, ext) => fs.existsSync(`${path}${ext}`) || fs.existsSync(`${path}/index${ext}`)

module.exports = {
  meta: {
    docs: {
      description: 'Warn when using relative paths to modules aliased',
      category: 'Fill me in',
      recommended: false,
    },
    fixable: null, // or "code" or "whitespace"
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

  create: function(context) {
    const filename = context.getFilename()
    const filePath = path.dirname(filename)

    // Plugin options.
    const options = getProperties(context.options)
    const projectRootAbsolutePath = findProjectRoot(filePath, options.projectRoot)

    // Find alias via babel-plugin-module-resolver config.
    let alias = {}
    const babelDir = projectRootAbsolutePath || '.'
    const { config } = findBabelConfig.sync(babelDir)
    try {
      const validPluginNames = new Set(['babel-plugin-module-resolver', 'module-resolver'])
      const [moduleResolver] = config.plugins.filter(plugins => {
        if (Array.isArray(plugins) && validPluginNames.has(plugins[0])) {
          return plugins
        }
      })
      alias = moduleResolver[1].alias
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
    const aliasPaths = values(alias).map(a => path.join(cwd, a))

    const hasError = val => {
      if (!val) return // template literals will have undefined val

      const { ignoreDepth, projectRoot, extensions, allowDepthMoreOrLessThanEquality } = options

      // Ignore if directory depth matches options.
      if (checkIgnoreDepth({ ignoreDepth, path: val, allowDepthMoreOrLessThanEquality })) return

      // Error if projectRoot option specified but cannot be resolved.
      if (projectRoot && !projectRootAbsolutePath) {
        return true
      }

      const resolvedPath = path.resolve(filePath, val)
      const resolvedExt = path.extname(val) ? '' : '.js'

      let pathExists = checkPath(resolvedPath, resolvedExt)

      if (extensions && !pathExists) {
        pathExists = extensions.filter(ext => checkPath(resolvedPath, ext)).length
      }

      const isAliased = aliasPaths.some(aliasPath => resolvedPath.includes(aliasPath))
      return isAliased && pathExists && val.match(/\.\.\//) // matches, exists, and starts with ../
    }

    return {
      ImportDeclaration(node) {
        if (hasError(node.source.value)) {
          context.report({
            node,
            message: 'Do not use relative path for aliased modules',
            loc: node.source.loc,
          })
        }
      },

      CallExpression(node) {
        const val = node.callee.name || node.callee.type
        if (val === 'Import' || val === 'require') {
          hasError(node.arguments[0].value) &&
            context.report({
              node,
              message: 'Do not use relative path for aliased modules',
              loc: node.arguments[0].loc,
            })
        }
      },
    }
  },
}
