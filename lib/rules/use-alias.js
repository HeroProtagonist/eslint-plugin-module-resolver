const findBabelConfig = require('find-babel-config')
const path = require('path')
const fs = require('fs')

const checkIgnoreDepth = require('../helpers/check-ignore-depth')
const getProperties = require('../helpers/get-properties')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

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
    schema: [{
      type: 'object',
      properties: {
        ignoreDepth: {
          type: 'number',
        },
        extensions: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "string",
            enum: ['.ts', '.tsx', '.jsx']
          }
        },
      },
      additionalProperties: false,
    }],
  },

  create: function(context) {
    const { config } = findBabelConfig.sync('.')
    const { options } = context
    // try/catch
    // handle name collision with package.json

    const validPluginNames = new Set(['babel-plugin-module-resolver', 'module-resolver'])

    const [ moduleResolver ] = config.plugins.filter(plugins => {
      if (Array.isArray(plugins) && validPluginNames.has(plugins[0])) {
        return plugins
      }
    })

    const { alias = {}, root } = moduleResolver[1]

    const normalizedAliasArray = values(alias).map(a => path.join(process.cwd(), a))

    const hasError = val => {
      if (!val) return // template literals will have undefined val

      const { ignoreDepth, extensions } = getProperties(options)

      if (ignoreDepth) {
        const ignorePrefix = Array(ignoreDepth).fill('../').join('')

        if (checkIgnoreDepth({ ignorePrefix, path: val })) return
      }

      const filename = context.getFilename()
      const filePath = path.dirname(filename)
      const resolvedPath = path.resolve(filePath, val)
      const resolvedExt = path.extname(val) ? '' : '.js'

      let pathExists = checkPath(resolvedPath, resolvedExt)

      if (extensions && !pathExists) {
        pathExists = extensions.filter(ext => checkPath(resolvedPath, ext)).length
      }

      const isAliased = normalizedAliasArray.some(v => resolvedPath.includes(v))
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
