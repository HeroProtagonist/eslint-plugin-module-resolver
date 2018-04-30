const rule = require('../../../lib/rules/module-resolver')
const { RuleTester } = require('eslint')

// Change working directory so closest .babelrc is the one in tests/
process.chdir(__dirname)

const createInvalid = (code, type) => ({
  code,
  errors: [
    {
      message: 'Do not use relative path for aliased modules',
      type,
    },
  ],
})

const ruleTester = new RuleTester({ parser: 'babel-eslint' })
ruleTester.run('module-resolver', rule, {
  valid: [
    "require('actions/api')",
    "require('reducers/api')",
    "const { api } = require('actions/api')",
    "const { api } = require('reducers/api')",
    "import('actions/api')",
    "import('reducers/api')",
    "import { api } from 'reducers/api'",
    "import { api } from 'reducers/api'",
    "const { api } = dynamic(import('actions/api'))",
    "const { api } = dynamic(import('reducers/api'))",
  ],

  invalid: [
    createInvalid("require('../actions/api')", "CallExpression"),
    createInvalid("require('../reducers/api')", "CallExpression"),
    createInvalid("const { api } = require('./actions/api')", "CallExpression"),
    createInvalid("const { api } = require('./reducers/api')", "CallExpression"),
    createInvalid("import('../../actions/api')", "CallExpression"),
    createInvalid("import('../../reducers/api')", "CallExpression"),
    createInvalid("import { api } from './reducers/api'", "ImportDeclaration"),
    createInvalid("import { api } from './reducers/api'", "ImportDeclaration"),
    createInvalid("const { api } = dynamic(import('../actions/api'))", "CallExpression"),
    createInvalid("const { api } = dynamic(import('../reducers/api'))", "CallExpression"),
  ],
})
