const findBabelConfig = require('find-babel-config')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

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
    const {
      config: {
        env: { development: config },
      },
    } = findBabelConfig.sync('.')
    // try/catch
    // handle name collision with package.json
    const alias = config.plugins.reduce((mem, curr) => {
      if (Array.isArray(curr) && curr[0] === 'babel-plugin-module-resolver') {
        return curr[1].alias
      }
      return mem
    }, {})

    const normalizedAlias = Object.values(alias).map(a => a.replace(/\.?\.\//g, ''))
    const aliasSet = new Set(normalizedAlias)

    const hasError = val => {
      const rep = val.replace(/\.?\.\//g, '')
      const [ root ] = rep.split('/')
      return aliasSet.has(root) && val.match(/\.?\.\//)
    }

    return {
      ImportDeclaration(node) {
        if (hasError(node.source.value)) {
          context.report(node, 'Do not use relative path for aliased modules')
        }
      },

      CallExpression(node) {
        const val = node.callee.name || node.callee.type
        if (val === 'Import' || val === 'require') {
          hasError(node.arguments[0].value) &&
            context.report(node, 'Do not use relative path for aliased modules')
        }
      },
    }
  },
}
