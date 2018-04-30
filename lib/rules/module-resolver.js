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
    // variables should be defined here
    const transformed = new Set(['components/wat'])

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    const hasError = val => {
      const rep = val.replace(/\.?\.\//g, '')

      console.log('ORG: ', val)
      console.log('REP: ', rep)
      console.log('')

      console.log(transformed, rep)
      console.log(transformed.has(rep))
      console.log(rep !== val)
      return transformed.has(rep) && rep !== val
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
