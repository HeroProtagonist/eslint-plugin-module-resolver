const findBabelConfig = require('find-babel-config')
const path = require('path')
const fs = require('fs')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const values = Object.values || function (obj) { return Object.keys(obj).map(e => obj[e]) }

module.exports = {
  meta: {
    docs: {
      description: 'Warn when using relative paths to modules aliased',
      category: 'Fill me in',
      recommended: false,
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      // fill in your schema
    ],
  },

  create: function(context) {
    const { config } = findBabelConfig.sync('.')
    // try/catch
    // handle name collision with package.json

    const validPluginNames = new Set(['babel-plugin-module-resolver', 'module-resolver'])

    const [ moduleResolver ] = config.plugins.filter(plugins => {
      if (Array.isArray(plugins) && validPluginNames.has(plugins[0] )) {
        return plugins
      }
    })

    const { alias, root } = moduleResolver[1]

    const normalizedAliasArray = values(alias).map(a => path.join(process.cwd(), a))

    const hasError = val => {
      if (!val) return // template literals will have undefined val

      const filename = context.getFilename()
      const filePath = path.dirname(filename)

      const resolvedPath = path.resolve(filePath, val)
      const resolvedExt = path.extname(val) ? '' : '.js'

      const pathExists = fs.existsSync(`${resolvedPath}${resolvedExt}`) || fs.existsSync(`${resolvedPath}/index.js`)

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
